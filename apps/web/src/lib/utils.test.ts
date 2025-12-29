import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("class1", "class2");
      expect(result).toBe("class1 class2");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", "included", false);
      expect(result).toBe("base included");
    });

    it("should handle undefined and null values", () => {
      const result = cn("base", undefined, null, "end");
      expect(result).toBe("base end");
    });

    it("should handle array of classes", () => {
      const result = cn(["class1", "class2"]);
      expect(result).toBe("class1 class2");
    });

    it("should handle object syntax", () => {
      const result = cn({
        base: true,
        active: true,
        disabled: false,
      });
      expect(result).toBe("base active");
    });

    it("should merge Tailwind classes correctly", () => {
      // tailwind-merge should handle conflicting classes
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });

    it("should merge background colors correctly", () => {
      const result = cn("bg-red-500", "bg-blue-500");
      expect(result).toBe("bg-blue-500");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle mixed input types", () => {
      const result = cn(
        "base",
        ["array-class"],
        { "object-class": true },
        undefined,
        "final"
      );
      expect(result).toBe("base array-class object-class final");
    });
  });
});
