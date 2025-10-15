import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  messages: defineTable({
    content: v.string(),
    userId: v.string(),
    organizationId: v.string(),
  }).index("byOrganization", ["organizationId"]),
});
