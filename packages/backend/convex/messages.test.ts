import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("messages", () => {
  describe("createMessage", () => {
    it("should create a message with organization", async () => {
      const t = convexTest(schema, modules);

      const result = await t.mutation(api.messages.createMessage, {
        content: "Hello World",
        userId: "user123",
        organizationId: "org123",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should create a message with team", async () => {
      const t = convexTest(schema, modules);

      const result = await t.mutation(api.messages.createMessage, {
        content: "Team message",
        userId: "user123",
        teamId: "team123",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should create a message with both organization and team", async () => {
      const t = convexTest(schema, modules);

      const result = await t.mutation(api.messages.createMessage, {
        content: "Org and team message",
        userId: "user123",
        organizationId: "org123",
        teamId: "team123",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should handle empty content", async () => {
      const t = convexTest(schema, modules);

      const result = await t.mutation(api.messages.createMessage, {
        content: "",
        userId: "user123",
        organizationId: "org123",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });
  });

  describe("getMessagesByOrganization", () => {
    it("should return empty array for organization with no messages", async () => {
      const t = convexTest(schema, modules);

      const result = await t.query(api.messages.getMessagesByOrganization, {
        organizationId: "nonexistent-org",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual([]);
    });

    it("should return messages for organization", async () => {
      const t = convexTest(schema, modules);
      const organizationId = "org123";

      // Create test messages
      await t.mutation(api.messages.createMessage, {
        content: "Message 1",
        userId: "user123",
        organizationId,
      });

      await t.mutation(api.messages.createMessage, {
        content: "Message 2",
        userId: "user456",
        organizationId,
      });

      // Query messages
      const result = await t.query(api.messages.getMessagesByOrganization, {
        organizationId,
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.content).toBe("Message 1");
      expect(result.data[1]?.content).toBe("Message 2");
    });

    it("should not return messages from other organizations", async () => {
      const t = convexTest(schema, modules);

      // Create message in org1
      await t.mutation(api.messages.createMessage, {
        content: "Org1 message",
        userId: "user123",
        organizationId: "org1",
      });

      // Create message in org2
      await t.mutation(api.messages.createMessage, {
        content: "Org2 message",
        userId: "user123",
        organizationId: "org2",
      });

      // Query only org1 messages
      const result = await t.query(api.messages.getMessagesByOrganization, {
        organizationId: "org1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.content).toBe("Org1 message");
    });
  });

  describe("getMessagesByTeam", () => {
    it("should return empty array for team with no messages", async () => {
      const t = convexTest(schema, modules);

      const result = await t.query(api.messages.getMessagesByTeam, {
        teamId: "nonexistent-team",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual([]);
    });

    it("should return messages for team", async () => {
      const t = convexTest(schema, modules);
      const teamId = "team123";

      // Create test messages
      await t.mutation(api.messages.createMessage, {
        content: "Team message 1",
        userId: "user123",
        teamId,
      });

      await t.mutation(api.messages.createMessage, {
        content: "Team message 2",
        userId: "user456",
        teamId,
      });

      // Query messages
      const result = await t.query(api.messages.getMessagesByTeam, {
        teamId,
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
    });

    it("should not return messages from other teams", async () => {
      const t = convexTest(schema, modules);

      // Create message in team1
      await t.mutation(api.messages.createMessage, {
        content: "Team1 message",
        userId: "user123",
        teamId: "team1",
      });

      // Create message in team2
      await t.mutation(api.messages.createMessage, {
        content: "Team2 message",
        userId: "user123",
        teamId: "team2",
      });

      // Query only team1 messages
      const result = await t.query(api.messages.getMessagesByTeam, {
        teamId: "team1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.content).toBe("Team1 message");
    });
  });
});
