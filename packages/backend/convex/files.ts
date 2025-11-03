import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate an upload URL for file uploads
export const generateUploadUrl = mutation({
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

// Save file metadata after upload
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    uploadedBy: v.string(),
    organizationId: v.string(),
    teamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const fileId = await ctx.db.insert("files", {
        storageId: args.storageId,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize,
        uploadedBy: args.uploadedBy,
        organizationId: args.organizationId,
        teamId: args.teamId,
      });
      return { data: fileId, error: undefined };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});

// Get files by organization
export const getFilesByOrganization = query({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    try {
      const files = await ctx.db
        .query("files")
        .withIndex("byOrganization", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .collect();
      return { data: files, error: undefined };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});

// Get file URL for download
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    try {
      const url = await ctx.storage.getUrl(args.storageId);
      return { data: url, error: undefined };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
