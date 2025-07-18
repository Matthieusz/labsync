import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { id } from "zod/v4/locales";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { group, groupMember } from "@/db/schema/group";
import { protectedProcedure, router } from "@/lib/trpc";

export const groupRouter = router({
	getAll: protectedProcedure.query(async () => {
		return await db.select().from(group);
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const result = await db
				.select()
				.from(group)
				.where(eq(group.id, input.id))
				.limit(1);

			if (result.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Group not found",
				});
			}

			const members = await db
				.select({
					id: groupMember.id,
					userId: groupMember.userId,
					groupId: groupMember.groupId,
					createdAt: groupMember.createdAt,
					updatedAt: groupMember.updatedAt,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
					},
				})
				.from(groupMember)
				.leftJoin(user, eq(groupMember.userId, user.id))
				.where(eq(groupMember.groupId, input.id));

			return {
				...result[0],
				members,
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
