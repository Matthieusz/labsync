import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    content: v.string(),
    userId: v.string(),
    organizationId: v.optional(v.string()),
    teamId: v.optional(v.string()),
  })
    .index("byOrganization", ["organizationId"])
    .index("byTeam", ["teamId"]),
  files: defineTable({
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    uploadedBy: v.string(),
    organizationId: v.string(),
    teamId: v.optional(v.string()),
  })
    .index("byOrganization", ["organizationId"])
    .index("byTeam", ["teamId"]),
  exams: defineTable({
    title: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
    createdBy: v.string(),
    organizationId: v.string(),
    teamId: v.optional(v.string()),
  })
    .index("byOrganization", ["organizationId"])
    .index("byTeam", ["teamId"])
    .index("byDate", ["organizationId", "date"]),
});
