import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { group, groupMember } from "@/db/schema/group";
import { protectedProcedure, router } from "@/lib/trpc";

export const groupRouter = router({
	getAll: protectedProcedure.query(async () => {
		return await db.select().from(group);
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const groupData = await db.query.group.findFirst({
				where: eq(group.id, input.id),
			});

			if (!groupData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Group not found",
				});
			}

			const membersData = await db.query.groupMember.findMany({
				where: eq(groupMember.groupId, input.id),
				with: {
					user: true,
					group: true,
				},
			});

			return {
				group: groupData,
				members: membersData,
			};
		}),

	create: protectedProcedure
		.input(z.object({ name: z.string().min(1), description: z.string() }))
		.mutation(async ({ input }) => {
			return await db.insert(group).values({
				id: crypto.randomUUID(), // generate an unique ID
				name: input.name,
				description: input.description,
				isPublic: false, // default for now
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}),

	join: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const existingMember = await db
				.select()
				.from(groupMember)
				.where(
					and(
						eq(groupMember.userId, userId),
						eq(groupMember.groupId, input.groupId),
					),
				)
				.limit(1);

			if (existingMember.length > 0) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "You are already a member of this group",
				});
			}

			await db
				.update(group)
				.set({
					memberCount: sql`${group.memberCount} + 1`,
					updatedAt: new Date(),
				})
				.where(eq(group.id, input.groupId));
			return await db.insert(groupMember).values({
				userId,
				groupId: input.groupId,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}),

	update: protectedProcedure
		.input(
			z.object({ id: z.string(), name: z.string(), description: z.string() }),
		)
		.mutation(async ({ input }) => {
			return await db
				.update(group)
				.set({
					name: input.name,
					description: input.description,
					updatedAt: new Date(),
				})
				.where(eq(group.id, input.id));
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			return await db.delete(group).where(eq(group.id, input.id));
		}),
});
