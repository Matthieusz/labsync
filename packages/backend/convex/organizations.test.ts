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

import { api } from "./_generated/api";
// Import after mocking
import { authComponent } from "./auth";

// Helper to create mock auth responses
function createMockAuth(overrides: {
  listOrganizations?: unknown[];
  listMembers?: { members: unknown[] };
  createOrganization?: unknown;
  createInvitation?: unknown;
  getSession?: { user?: { email?: string; id?: string } };
  listUserInvitations?: unknown[];
  acceptInvitation?: unknown;
  rejectInvitation?: unknown;
}) {
  return {
    api: {
      listOrganizations: vi
        .fn()
        .mockResolvedValue(overrides.listOrganizations ?? []),
      listMembers: vi
        .fn()
        .mockResolvedValue(overrides.listMembers ?? { members: [] }),
      createOrganization: vi.fn().mockResolvedValue(
        overrides.createOrganization ?? {
          id: "org-new",
          name: "New Org",
          slug: "new-org",
        }
      ),
      createInvitation: vi
        .fn()
        .mockResolvedValue(overrides.createInvitation ?? { id: "invite-1" }),
      getSession: vi.fn().mockResolvedValue(
        overrides.getSession ?? {
          user: { email: "test@example.com", id: "user-1" },
        }
      ),
      listUserInvitations: vi
        .fn()
        .mockResolvedValue(overrides.listUserInvitations ?? []),
      acceptInvitation: vi
        .fn()
        .mockResolvedValue(overrides.acceptInvitation ?? { success: true }),
      rejectInvitation: vi
        .fn()
        .mockResolvedValue(overrides.rejectInvitation ?? { success: true }),
    },
  };
}

describe("organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrganizationMembersById", () => {
    it("should return organization members by id", async () => {
      const mockAuth = createMockAuth({
        listOrganizations: [
          { id: "org-1", name: "Test Org", slug: "test-org" },
        ],
        listMembers: {
          members: [
            {
              role: "owner",
              user: {
                name: "John Doe",
                email: "john@example.com",
                id: "user-1",
              },
            },
            {
              role: "member",
              user: {
                name: "Jane Doe",
                email: "jane@example.com",
                id: "user-2",
              },
            },
          ],
        },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.getOrganizationMembersById,
        {
          id: "org-1",
        }
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("org-1");
      expect(result.data?.name).toBe("Test Org");
      expect(result.data?.members).toHaveLength(2);
    });

    it("should return error when organization not found", async () => {
      const mockAuth = createMockAuth({
        listOrganizations: [],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.getOrganizationMembersById,
        {
          id: "non-existent",
        }
      );

      expect(result.error).toBe("Organization not found");
      expect(result.data).toBeNull();
    });

    it("should return error when organizations response is not array", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.listOrganizations = vi.fn().mockResolvedValue(null);

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.getOrganizationMembersById,
        {
          id: "org-1",
        }
      );

      expect(result.error).toBe("Organizations response not array");
      expect(result.data).toBeNull();
    });
  });

  describe("getOrganizationMembersBySlug", () => {
    it("should return organization members by slug", async () => {
      const mockAuth = createMockAuth({
        listOrganizations: [
          { id: "org-1", name: "Test Org", slug: "test-org" },
        ],
        listMembers: {
          members: [
            {
              role: "owner",
              user: {
                name: "John Doe",
                email: "john@example.com",
                id: "user-1",
              },
            },
          ],
        },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.getOrganizationMembersBySlug,
        {
          slug: "test-org",
        }
      );

      expect(result.error).toBeUndefined();
      expect(result.data?.slug).toBe("test-org");
      expect(result.data?.members).toHaveLength(1);
    });

    it("should return error when organization not found by slug", async () => {
      const mockAuth = createMockAuth({
        listOrganizations: [
          { id: "org-1", name: "Test Org", slug: "other-slug" },
        ],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.getOrganizationMembersBySlug,
        {
          slug: "non-existent",
        }
      );

      expect(result.error).toBe("Organization not found");
    });
  });

  describe("listOrganizationsWithOwners", () => {
    it("should return organizations with owners", async () => {
      const mockAuth = createMockAuth({
        listOrganizations: [
          { id: "org-1", name: "Org 1", slug: "org-1" },
          { id: "org-2", name: "Org 2", slug: "org-2" },
        ],
        listMembers: {
          members: [
            {
              role: "owner",
              user: { name: "Owner", email: "owner@example.com" },
            },
            {
              role: "member",
              user: { name: "Member", email: "member@example.com" },
            },
          ],
        },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.listOrganizationsWithOwners,
        {}
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].owner.name).toBe("Owner");
    });

    it("should return empty array when no organizations", async () => {
      const mockAuth = createMockAuth({
        listOrganizations: [],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.listOrganizationsWithOwners,
        {}
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual([]);
    });

    it("should return error when organizations response is invalid", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.listOrganizations = vi.fn().mockResolvedValue("invalid");

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.listOrganizationsWithOwners,
        {}
      );

      expect(result.error).toContain("not an array");
      expect(result.data).toEqual([]);
    });
  });

  describe("createOrganization", () => {
    it("should create an organization", async () => {
      const mockAuth = createMockAuth({
        createOrganization: {
          id: "org-new",
          name: "New Organization",
          slug: "new-org",
        },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.organizations.createOrganization, {
        name: "New Organization",
        slug: "new-org",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe("org-new");
    });

    it("should handle creation error", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.createOrganization = vi
        .fn()
        .mockRejectedValue(new Error("Creation failed"));

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.organizations.createOrganization, {
        name: "New Organization",
        slug: "new-org",
      });

      expect(result.error).toBe("Creation failed");
      expect(result.data).toBeNull();
    });
  });

  describe("inviteMemberToOrganization", () => {
    it("should invite a member to organization", async () => {
      const mockAuth = createMockAuth({
        createInvitation: { id: "invite-123", email: "invited@example.com" },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(
        api.organizations.inviteMemberToOrganization,
        {
          organizationId: "org-1",
          email: "invited@example.com",
        }
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should handle invitation error", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.createInvitation = vi
        .fn()
        .mockRejectedValue(new Error("Invitation failed"));

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(
        api.organizations.inviteMemberToOrganization,
        {
          organizationId: "org-1",
          email: "invited@example.com",
        }
      );

      expect(result.error).toBe("Invitation failed");
    });
  });

  describe("listPendingInvitations", () => {
    it("should list pending invitations", async () => {
      const mockAuth = createMockAuth({
        getSession: { user: { email: "test@example.com", id: "user-1" } },
        listUserInvitations: [
          { id: "invite-1", organizationId: "org-1" },
          { id: "invite-2", organizationId: "org-2" },
        ],
        listOrganizations: [
          { id: "org-1", name: "Org 1", slug: "org-1" },
          { id: "org-2", name: "Org 2", slug: "org-2" },
        ],
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.listPendingInvitations,
        {}
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].organizationName).toBe("Org 1");
    });

    it("should return error when user email not found", async () => {
      const mockAuth = createMockAuth({
        getSession: { user: {} },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.query(
        api.organizations.listPendingInvitations,
        {}
      );

      expect(result.error).toBe("User email not found");
    });
  });

  describe("acceptInvitation", () => {
    it("should accept an invitation", async () => {
      const mockAuth = createMockAuth({
        acceptInvitation: { success: true },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.organizations.acceptInvitation, {
        invitationId: "invite-1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should handle accept error", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.acceptInvitation = vi
        .fn()
        .mockRejectedValue(new Error("Accept failed"));

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.organizations.acceptInvitation, {
        invitationId: "invite-1",
      });

      expect(result.error).toBe("Accept failed");
    });
  });

  describe("rejectInvitation", () => {
    it("should reject an invitation", async () => {
      const mockAuth = createMockAuth({
        rejectInvitation: { success: true },
      });

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.organizations.rejectInvitation, {
        invitationId: "invite-1",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should handle reject error", async () => {
      const mockAuth = createMockAuth({});
      mockAuth.api.rejectInvitation = vi
        .fn()
        .mockRejectedValue(new Error("Reject failed"));

      vi.mocked(authComponent.getAuth).mockResolvedValue({
        auth: mockAuth,
        headers: new Headers(),
      } as never);

      const t = convexTest(schema, modules);
      const result = await t.mutation(api.organizations.rejectInvitation, {
        invitationId: "invite-1",
      });

      expect(result.error).toBe("Reject failed");
    });
  });
});
