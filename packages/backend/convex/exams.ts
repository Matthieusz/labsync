import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new exam
export const createExam = mutation({
  args: {
    title: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
    createdBy: v.string(),
    organizationId: v.string(),
    teamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const examId = await ctx.db.insert("exams", {
        title: args.title,
        date: args.date,
        description: args.description,
        createdBy: args.createdBy,
        organizationId: args.organizationId,
        teamId: args.teamId,
      });
      return { data: examId, error: undefined };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});

// Get exams by organization
export const getExamsByOrganization = query({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    try {
      const exams = await ctx.db
        .query("exams")
        .withIndex("byOrganization", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .order("asc")
        .collect();
      return { data: exams, error: undefined };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});

// Delete an exam
export const deleteExam = mutation({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.examId);
      return { data: true, error: undefined };
    } catch (err) {
      return {
        data: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
