import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("healthCheck", () => {
  describe("get", () => {
    it("should return OK", async () => {
      const t = convexTest(schema, modules);

      const result = await t.query(api.healthCheck.get, {});

      expect(result).toBe("OK");
    });

    it("should consistently return OK on multiple calls", async () => {
      const t = convexTest(schema, modules);

      const result1 = await t.query(api.healthCheck.get, {});
      const result2 = await t.query(api.healthCheck.get, {});
      const result3 = await t.query(api.healthCheck.get, {});

      expect(result1).toBe("OK");
      expect(result2).toBe("OK");
      expect(result3).toBe("OK");
    });
  });
});
