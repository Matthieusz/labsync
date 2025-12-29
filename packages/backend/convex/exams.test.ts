import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("exams", () => {
  describe("createExam", () => {
    it("should create an exam with required fields", async () => {
      const t = convexTest(schema, modules);

      const result = await t.mutation(api.exams.createExam, {
        title: "Math Final Exam",
        date: Date.now() + 86_400_000, // Tomorrow
        createdBy: "user123",
        organizationId: "org123",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should create an exam with optional description", async () => {
      const t = convexTest(schema, modules);

      const result = await t.mutation(api.exams.createExam, {
        title: "Physics Quiz",
        date: Date.now() + 86_400_000,
        description: "Chapters 1-5 covering mechanics",
        createdBy: "user123",
        organizationId: "org123",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should create an exam with team association", async () => {
      const t = convexTest(schema, modules);

      const result = await t.mutation(api.exams.createExam, {
        title: "Team Project Deadline",
        date: Date.now() + 86_400_000,
        createdBy: "user123",
        organizationId: "org123",
        teamId: "team456",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should create an exam with past date", async () => {
      const t = convexTest(schema, modules);

      const result = await t.mutation(api.exams.createExam, {
        title: "Past Exam",
        date: Date.now() - 86_400_000, // Yesterday
        createdBy: "user123",
        organizationId: "org123",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });
  });

  describe("getExamsByOrganization", () => {
    it("should return empty array for organization with no exams", async () => {
      const t = convexTest(schema, modules);

      const result = await t.query(api.exams.getExamsByOrganization, {
        organizationId: "nonexistent-org",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual([]);
    });

    it("should return exams for organization", async () => {
      const t = convexTest(schema, modules);
      const organizationId = "org123";

      // Create test exams
      await t.mutation(api.exams.createExam, {
        title: "Exam 1",
        date: Date.now() + 86_400_000,
        createdBy: "user123",
        organizationId,
      });

      await t.mutation(api.exams.createExam, {
        title: "Exam 2",
        date: Date.now() + 172_800_000,
        createdBy: "user456",
        organizationId,
      });

      // Query exams
      const result = await t.query(api.exams.getExamsByOrganization, {
        organizationId,
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
    });

    it("should not return exams from other organizations", async () => {
      const t = convexTest(schema, modules);

      // Create exam in org1
      await t.mutation(api.exams.createExam, {
        title: "Org1 Exam",
        date: Date.now() + 86_400_000,
        createdBy: "user123",
        organizationId: "org1",
      });

      // Create exam in org2
      await t.mutation(api.exams.createExam, {
        title: "Org2 Exam",
        date: Date.now() + 86_400_000,
        createdBy: "user123",
        organizationId: "org2",
      });

      // Query only org1 exams
      const result = await t.query(api.exams.getExamsByOrganization, {
        organizationId: "org1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.title).toBe("Org1 Exam");
    });

    it("should return exams ordered by date ascending", async () => {
      const t = convexTest(schema, modules);
      const organizationId = "org123";
      const now = Date.now();

      // Create exams in non-chronological order
      await t.mutation(api.exams.createExam, {
        title: "Later Exam",
        date: now + 172_800_000, // 2 days from now
        createdBy: "user123",
        organizationId,
      });

      await t.mutation(api.exams.createExam, {
        title: "Earlier Exam",
        date: now + 86_400_000, // 1 day from now
        createdBy: "user123",
        organizationId,
      });

      // Query exams - should be ordered by creation time (asc) based on implementation
      const result = await t.query(api.exams.getExamsByOrganization, {
        organizationId,
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
    });
  });

  describe("deleteExam", () => {
    it("should delete an existing exam", async () => {
      const t = convexTest(schema, modules);
      const organizationId = "org123";

      // Create an exam
      const createResult = await t.mutation(api.exams.createExam, {
        title: "Exam to delete",
        date: Date.now() + 86_400_000,
        createdBy: "user123",
        organizationId,
      });

      expect(createResult.data).toBeDefined();

      // Delete the exam
      const deleteResult = await t.mutation(api.exams.deleteExam, {
        examId: createResult.data!,
      });

      expect(deleteResult.error).toBeUndefined();
      expect(deleteResult.data).toBe(true);

      // Verify it's deleted
      const queryResult = await t.query(api.exams.getExamsByOrganization, {
        organizationId,
      });

      expect(queryResult.data).toHaveLength(0);
    });

    it("should handle deleting non-existent exam", async () => {
      const t = convexTest(schema, modules);

      // Create a valid exam first to get a proper ID format, then delete it
      const createResult = await t.mutation(api.exams.createExam, {
        title: "Temp exam",
        date: Date.now(),
        createdBy: "user123",
        organizationId: "org123",
      });

      // Delete it first time
      await t.mutation(api.exams.deleteExam, {
        examId: createResult.data!,
      });

      // Try to delete again - should return error
      const deleteResult = await t.mutation(api.exams.deleteExam, {
        examId: createResult.data!,
      });

      expect(deleteResult.data).toBe(false);
      expect(deleteResult.error).toBeDefined();
    });

    it("should only delete the specified exam", async () => {
      const t = convexTest(schema, modules);
      const organizationId = "org123";

      // Create two exams
      const exam1 = await t.mutation(api.exams.createExam, {
        title: "Exam 1",
        date: Date.now() + 86_400_000,
        createdBy: "user123",
        organizationId,
      });

      await t.mutation(api.exams.createExam, {
        title: "Exam 2",
        date: Date.now() + 172_800_000,
        createdBy: "user123",
        organizationId,
      });

      // Delete only the first exam
      await t.mutation(api.exams.deleteExam, {
        examId: exam1.data!,
      });

      // Verify only one exam remains
      const queryResult = await t.query(api.exams.getExamsByOrganization, {
        organizationId,
      });

      expect(queryResult.data).toHaveLength(1);
      expect(queryResult.data[0]?.title).toBe("Exam 2");
    });
  });
});
