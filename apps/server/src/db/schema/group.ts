import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const group = pgTable("groups", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	memberCount: integer("member_count").default(0).notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const groupRelations = relations(group, ({ many }) => ({
	members: many(groupMember),
}));

export const groupMember = pgTable("group_member", {
	id: serial("id").primaryKey(),
	groupId: text("group_id")
		.notNull()
		.references(() => group.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	role: text("role").notNull().default("member"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
	group: one(group, { fields: [groupMember.groupId], references: [group.id] }),
	user: one(user, { fields: [groupMember.userId], references: [user.id] }),
}));
