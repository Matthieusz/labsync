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
    organizationId: v.optional(v.string()),
    teamId: v.optional(v.string()),
  })
    .index("byOrganization", ["organizationId"])
    .index("byTeam", ["teamId"]),
});
