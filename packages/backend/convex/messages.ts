import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createMessage = mutation({
  args: { content: v.string(), userId: v.string(), organizationId: v.string() },
  handler: async (ctx, args) => {
    try {
      const newMessage = await ctx.db.insert("messages", {
        content: args.content,
        userId: args.userId,
        organizationId: args.organizationId,
      });
      return { data: newMessage, error: undefined };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});

export const getMessagesByOrganization = query({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    try {
      const messages = await ctx.db
        .query("messages")
        .withIndex("byOrganization", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .collect();
      return { data: messages, error: undefined };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
