import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import {
  handleConvexResult,
  handleError,
  isConvexSuccess,
  withErrorHandling,
} from "./error-handling";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("error-handling", () => {
  describe("handleError", () => {
    it("should handle Error instances", () => {
      const error = new Error("Test error message");
      const result = handleError(error);

      expect(result).toBe("Test error message");
      expect(toast.error).toHaveBeenCalledWith("Test error message");
    });

    it("should handle string errors", () => {
      const result = handleError("String error");

      expect(result).toBe("String error");
      expect(toast.error).toHaveBeenCalledWith("String error");
    });

    it("should use fallback message for unknown errors", () => {
      const result = handleError({ some: "object" }, "Custom fallback");

      expect(result).toBe("Custom fallback");
      expect(toast.error).toHaveBeenCalledWith("Custom fallback");
    });

    it("should use default fallback message when none provided", () => {
      const result = handleError(null);

      expect(result).toBe("An unexpected error occurred");
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred");
    });
  });

  describe("handleConvexResult", () => {
    it("should return true for successful results", () => {
      const result = { data: { id: "123" }, error: undefined };
      const isSuccess = handleConvexResult(result);

      expect(isSuccess).toBe(true);
    });

    it("should return false and show error for error results", () => {
      const result = { data: null, error: "Something went wrong" };
      const isSuccess = handleConvexResult(result);

      expect(isSuccess).toBe(false);
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });

    it("should return false and show fallback for null data without error", () => {
      const result = { data: null };
      const isSuccess = handleConvexResult(result, {
        errorFallback: "Custom error",
      });

      expect(isSuccess).toBe(false);
      expect(toast.error).toHaveBeenCalledWith("Custom error");
    });

    it("should show success message when provided", () => {
      const result = { data: { id: "123" }, error: undefined };
      handleConvexResult(result, { successMessage: "Created successfully!" });

      expect(toast.success).toHaveBeenCalledWith("Created successfully!");
    });
  });

  describe("withErrorHandling", () => {
    it("should return result for successful operations", async () => {
      const operation = vi.fn().mockResolvedValue({ id: "123" });
      const result = await withErrorHandling(operation);

      expect(result).toEqual({ id: "123" });
    });

    it("should return undefined and show error for failed operations", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("Failed"));
      const result = await withErrorHandling(operation);

      expect(result).toBeUndefined();
      expect(toast.error).toHaveBeenCalledWith("Failed");
    });

    it("should show success message when provided", async () => {
      const operation = vi.fn().mockResolvedValue({ id: "123" });
      await withErrorHandling(operation, { successMessage: "Done!" });

      expect(toast.success).toHaveBeenCalledWith("Done!");
    });

    it("should use custom error fallback", async () => {
      const operation = vi.fn().mockRejectedValue({});
      await withErrorHandling(operation, { errorFallback: "Custom fallback" });

      expect(toast.error).toHaveBeenCalledWith("Custom fallback");
    });
  });

  describe("isConvexSuccess", () => {
    it("should return true for successful results", () => {
      const result = { data: { id: "123" }, error: undefined };
      expect(isConvexSuccess(result)).toBe(true);
    });

    it("should return false for error results", () => {
      const result = { data: null, error: "Error" };
      expect(isConvexSuccess(result)).toBe(false);
    });

    it("should return false for null data", () => {
      const result = { data: null };
      expect(isConvexSuccess(result)).toBe(false);
    });
  });
});
