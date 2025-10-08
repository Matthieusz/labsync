import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { tables as authTables } from "./betterAuth/schema";

export default defineSchema({
  // Better Auth / organization plugin tables
  ...authTables,
  // Application tables
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
});
