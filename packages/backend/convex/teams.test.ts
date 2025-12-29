import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import schema from "./schema";
import { modules } from "./test.setup";

// Mock the auth module
vi.mock("./auth", () => ({
  authComponent: {
    getAuth: vi.fn(),
  },
  createAuth: vi.fn(),
}));

// Mock the password functions from better-auth/crypto
vi.mock("better-auth/crypto", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
  verifyPassword: vi.fn(),
}));

import { verifyPassword } from "better-auth/crypto";
import { api } from "./_generated/api";
// Import after mocking
import { authComponent } from "./auth";

// Helper to create mock auth responses
function createMockAuth(overrides: {
  listOrganizationTeams?: unknown[];
  listUserTeams?: unknown[];
  createTeam?: unknown;
  addTeamMember?: unknown;
  getSession?: { user?: { id?: string } } | null;
}) {
  return {
    api: {
      listOrganizationTeams: vi
        .fn()
        .mockResolvedValue(overrides.listOrganizationTeams ?? []),
      listUserTeams: vi.fn().mockResolvedValue(overrides.listUserTeams ?? []),
      createTeam: vi
        .fn()
        .mockResolvedValue(
          overrides.createTeam ?? { id: "team-new", name: "New Team" }
        ),
      addTeamMember: vi
        .fn()
        .mockResolvedValue(overrides.addTeamMember ?? { success: true }),
      getSession: vi
        .fn()
        .mockResolvedValue(overrides.getSession ?? { user: { id: "user-1" } }),
    },
  };
}

describe("teams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTeamsByOrganization", () => {
    it("should return teams for an organization", async () => {
      const mockAuth = createMockAuth({
        listOrganizationTeams: [
          { id: "team-1", name: "Team Alpha" },
          { id: "team-2", name: "Team Beta" },
        ],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(api.teams.listTeamsByOrganization, {
        organizationId: "org-1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
      expect(result.data![0].name).toBe("Team Alpha");
    });

    it("should return empty array when no teams", async () => {
      const mockAuth = createMockAuth({
        listOrganizationTeams: [],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(api.teams.listTeamsByOrganization, {
        organizationId: "org-1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual([]);
    });

    it("should handle error when listing teams", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.listOrganizationTeams = vi
        .fn()
        .mockRejectedValue(new Error("List failed"));

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(api.teams.listTeamsByOrganization, {
        organizationId: "org-1",
      });

      expect(result.error).toBe("List failed");
      expect(result.data).toBeNull();
    });
  });

  describe("createTeamInOrganization", () => {
    it("should create a team with password", async () => {
      const mockAuth = createMockAuth({
        createTeam: { id: "team-new", name: "New Team" },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.teams.createTeamInOrganization, {
        organizationId: "org-1",
        name: "New Team",
        password: "secret123",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe("New Team");
    });

    it("should handle creation error", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.createTeam = vi
        .fn()
        .mockRejectedValue(new Error("Creation failed"));

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.teams.createTeamInOrganization, {
        organizationId: "org-1",
        name: "New Team",
        password: "secret123",
      });

      expect(result.error).toBe("Creation failed");
      expect(result.data).toBeNull();
    });
  });

  describe("listTeamsSplitByMembership", () => {
    it("should split teams by user membership", async () => {
      const mockAuth = createMockAuth({
        listOrganizationTeams: [
          { id: "team-1", name: "Team Alpha" },
          { id: "team-2", name: "Team Beta" },
          { id: "team-3", name: "Team Gamma" },
        ],
        listUserTeams: [{ id: "team-1", name: "Team Alpha" }],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(api.teams.listTeamsSplitByMembership, {
        organizationId: "org-1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data?.joined).toHaveLength(1);
      expect(result.data?.joined[0].name).toBe("Team Alpha");
      expect(result.data?.available).toHaveLength(2);
    });

    it("should return all teams in available when user has no teams", async () => {
      const mockAuth = createMockAuth({
        listOrganizationTeams: [
          { id: "team-1", name: "Team Alpha" },
          { id: "team-2", name: "Team Beta" },
        ],
        listUserTeams: [],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(api.teams.listTeamsSplitByMembership, {
        organizationId: "org-1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data?.joined).toHaveLength(0);
      expect(result.data?.available).toHaveLength(2);
    });

    it("should return all teams in joined when user is in all teams", async () => {
      const mockAuth = createMockAuth({
        listOrganizationTeams: [{ id: "team-1", name: "Team Alpha" }],
        listUserTeams: [{ id: "team-1", name: "Team Alpha" }],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(api.teams.listTeamsSplitByMembership, {
        organizationId: "org-1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data?.joined).toHaveLength(1);
      expect(result.data?.available).toHaveLength(0);
    });

    it("should handle error when listing teams", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.listOrganizationTeams = vi
        .fn()
        .mockRejectedValue(new Error("List failed"));

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(api.teams.listTeamsSplitByMembership, {
        organizationId: "org-1",
      });

      expect(result.error).toBe("List failed");
      expect(result.data).toBeNull();
    });
  });

  describe("joinTeamWithPassword", () => {
    it("should join team with correct password", async () => {
      vi.mocked(verifyPassword).mockResolvedValue(true);

      const mockAuth = createMockAuth({
        listOrganizationTeams: [
          { id: "team-1", name: "Team Alpha", password: "hashed-password" },
        ],
        getSession: { user: { id: "user-1" } },
        addTeamMember: { success: true },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.teams.joinTeamWithPassword, {
        teamId: "team-1",
        password: "secret123",
        organizationId: "org-1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should return error for incorrect password", async () => {
      vi.mocked(verifyPassword).mockResolvedValue(false);

      const mockAuth = createMockAuth({
        listOrganizationTeams: [
          { id: "team-1", name: "Team Alpha", password: "hashed-password" },
        ],
        getSession: { user: { id: "user-1" } },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.teams.joinTeamWithPassword, {
        teamId: "team-1",
        password: "wrong-password",
        organizationId: "org-1",
      });

      expect(result.error).toBe("Invalid password");
    });

    it("should return error when team not found", async () => {
      const mockAuth = createMockAuth({
        listOrganizationTeams: [],
        getSession: { user: { id: "user-1" } },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.teams.joinTeamWithPassword, {
        teamId: "non-existent",
        password: "secret123",
        organizationId: "org-1",
      });

      expect(result.error).toBe("Team not found");
    });

    it("should return error when user not authenticated", async () => {
      // Reset verifyPassword to not interfere with this test
      vi.mocked(verifyPassword).mockResolvedValue(true);

      // Create a mock where getSession returns a session without a user
      const mockAuth = {
        api: {
          listOrganizationTeams: vi
            .fn()
            .mockResolvedValue([
              { id: "team-1", name: "Team Alpha", password: "hashed-password" },
            ]),
          listUserTeams: vi.fn().mockResolvedValue([]),
          createTeam: vi
            .fn()
            .mockResolvedValue({ id: "team-new", name: "New Team" }),
          addTeamMember: vi.fn().mockResolvedValue({ success: true }),
          getSession: vi.fn().mockResolvedValue({ user: null }),
        },
      };

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.teams.joinTeamWithPassword, {
        teamId: "team-1",
        password: "secret123",
        organizationId: "org-1",
      });

      expect(result.error).toBe("User not authenticated");
    });
  });
});
