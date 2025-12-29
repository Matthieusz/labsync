import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("privateData", () => {
  describe("get", () => {
    it("should return not authenticated message when no identity", async () => {
      const t = convexTest(schema, modules);

      const result = await t.query(api.privateData.get);

      expect(result).toEqual({
        message: "Not authenticated",
      });
    });

    it("should return private message when authenticated", async () => {
      const t = convexTest(schema, modules);

      // Simulate an authenticated user
      const asUser = t.withIdentity({
        name: "Test User",
        email: "test@example.com",
        tokenIdentifier: "test-token-123",
      });

      const result = await asUser.query(api.privateData.get);

      expect(result).toEqual({
        message: "This is private",
      });
    });

    it("should return private message for any authenticated user", async () => {
      const t = convexTest(schema, modules);

      // Simulate a different authenticated user
      const asUser = t.withIdentity({
        name: "Another User",
        email: "another@example.com",
        tokenIdentifier: "different-token-456",
      });

      const result = await asUser.query(api.privateData.get);

      expect(result).toEqual({
        message: "This is private",
      });
    });

    it("should handle identity with minimal required fields", async () => {
      const t = convexTest(schema, modules);

      // Simulate user with only required tokenIdentifier
      const asUser = t.withIdentity({
        tokenIdentifier: "minimal-token",
      });

      const result = await asUser.query(api.privateData.get);

      expect(result).toEqual({
        message: "This is private",
      });
    });
  });
});
