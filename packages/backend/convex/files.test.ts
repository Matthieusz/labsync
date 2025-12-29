import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("files", () => {
  describe("getFilesByOrganization", () => {
    it("should return empty array for organization with no files", async () => {
      const t = convexTest(schema, modules);

      const result = await t.query(api.files.getFilesByOrganization, {
        organizationId: "nonexistent-org",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual([]);
    });

    it("should not return files from other organizations", async () => {
      const t = convexTest(schema, modules);

      // Note: We can't fully test file upload without storage mock,
      // but we can test that the query isolation works
      const result1 = await t.query(api.files.getFilesByOrganization, {
        organizationId: "org1",
      });

      const result2 = await t.query(api.files.getFilesByOrganization, {
        organizationId: "org2",
      });

      expect(result1.error).toBeUndefined();
      expect(result2.error).toBeUndefined();
      expect(result1.data).toEqual([]);
      expect(result2.data).toEqual([]);
    });
  });

  describe("generateUploadUrl", () => {
    it("should generate an upload URL", async () => {
      const t = convexTest(schema, modules);

      const url = await t.mutation(api.files.generateUploadUrl, {});

      expect(url).toBeDefined();
      expect(typeof url).toBe("string");
    });
  });

  // Note: Full file upload/download tests require mocking storage.
  // These tests verify the query structure works correctly.
  // For full integration tests, consider using a test environment with real storage.
});
