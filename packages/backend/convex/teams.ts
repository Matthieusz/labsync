import { hashPassword, verifyPassword } from "better-auth/crypto";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

export const listTeamsByOrganization = query({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      // List teams for the organization
      const teamsRes = await auth.api.listOrganizationTeams({
        headers,
        query: { organizationId: args.organizationId },
      });
      const teams: Array<{
        id: string;
        name: string;
        createdAt?: number;
      }> = Array.isArray(teamsRes)
        ? teamsRes.map((team) => ({
            id: team.id,
            name: team.name,
            createdAt:
              team.createdAt instanceof Date
                ? team.createdAt.getTime()
                : undefined,
          }))
        : [];
      return { error: undefined, data: teams };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const createTeamInOrganization = mutation({
  args: { organizationId: v.string(), name: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      // Hash the password before creating the team
      const hashedPassword = await hashPassword(args.password);
      // Create team in organization
      const teamRes = await auth.api.createTeam({
        headers,
        body: {
          organizationId: args.organizationId,
          name: args.name,
          password: hashedPassword,
        },
      });
      return { error: undefined, data: teamRes };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const createOrganization = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      // Create organization
      const orgRes = await auth.api.createOrganization({
        headers,
        body: {
          name: args.name,
          slug: args.slug,
        },
      });
      return { error: undefined, data: orgRes };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const listOrganizationsWithOwners = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      // List organizations for the current user
      const orgs = await auth.api.listOrganizations({
        headers,
      });
      if (!Array.isArray(orgs)) {
        return {
          data: [],
          error: "Failed to fetch organizations: orgs is not an array",
        };
      }
      const results = await Promise.all(
        orgs.map(async (org: { id: string; name: string; slug?: string }) => {
          const membersRes = await auth.api.listMembers({
            headers,
            query: { organizationId: org.id },
          });
          const arr: Array<{
            role: string;
            user?: { name?: string; email?: string };
          }> = Array.isArray(membersRes?.members) ? membersRes.members : [];
          const owner = arr.find((m) => m.role === "owner");
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            memberCount: arr.length,
            owner: {
              name: owner?.user?.name,
              email: owner?.user?.email,
            },
          };
        })
      );
      return { data: results, error: undefined };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});

export const getOrganizationMembersBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      // List organizations and find by slug
      const orgs = await auth.api.listOrganizations({ headers });
      if (!Array.isArray(orgs)) {
        return { error: "Organizations response not array", data: null };
      }
      const org = orgs.find(
        (o: { id: string; name: string; slug?: string }) => o.slug === args.slug
      );
      if (!org) {
        return { error: "Organization not found", data: null };
      }
      const membersRes = await auth.api.listMembers({
        headers,
        query: { organizationId: org.id },
      });
      const members: Array<{
        role: string;
        user?: { name?: string; email?: string; id?: string };
      }> = Array.isArray(membersRes?.members) ? membersRes.members : [];
      return {
        error: undefined,
        data: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          members: members.map((m) => ({
            role: m.role,
            name: m.user?.name,
            email: m.user?.email,
            userId: m.user?.id,
          })),
        },
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const getOrganizationMembersById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      // List organizations and find by ID
      const orgs = await auth.api.listOrganizations({ headers });
      if (!Array.isArray(orgs)) {
        return { error: "Organizations response not array", data: null };
      }
      const org = orgs.find(
        (o: { id: string; name: string; slug?: string }) => o.id === args.id
      );
      if (!org) {
        return { error: "Organization not found", data: null };
      }
      const membersRes = await auth.api.listMembers({
        headers,
        query: { organizationId: org.id },
      });
      const members: Array<{
        role: string;
        user?: { name?: string; email?: string; id?: string };
      }> = Array.isArray(membersRes?.members) ? membersRes.members : [];
      return {
        error: undefined,
        data: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          members: members.map((m) => ({
            role: m.role,
            name: m.user?.name,
            email: m.user?.email,
            userId: m.user?.id,
          })),
        },
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const inviteMemberToOrganization = mutation({
  args: { organizationId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      // Invite member to organization
      const inviteRes = await auth.api.createInvitation({
        headers,
        body: {
          organizationId: args.organizationId,
          email: args.email,
          role: "member",
        },
      });
      return { error: undefined, data: inviteRes };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const listPendingInvitations = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

      const user = await auth.api.getSession({ headers });
      if (!user?.user?.email) {
        return { error: "User email not found", data: null };
      }

      const invitations = await auth.api.listUserInvitations({
        headers,
        query: {
          email: user.user.email,
        },
      });

      const orgs = await auth.api.listOrganizations({ headers });
      const orgMap: Record<string, { name: string; slug?: string }> = {};

      if (Array.isArray(orgs)) {
        for (const org of orgs) {
          orgMap[org.id] = { name: org.name, slug: org.slug };
        }
      }

      const enhancedInvitations = Array.isArray(invitations)
        ? invitations.map(
            (invitation: {
              organizationId: string;
              [key: string]: unknown;
            }) => ({
              ...invitation,
              organizationName:
                orgMap[invitation.organizationId]?.name ||
                "Unknown Organization",
              organizationSlug: orgMap[invitation.organizationId]?.slug,
            })
          )
        : [];

      return { error: undefined, data: enhancedInvitations };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const acceptInvitation = mutation({
  args: { invitationId: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      const result = await auth.api.acceptInvitation({
        headers,
        body: {
          invitationId: args.invitationId,
        },
      });
      return { error: undefined, data: result };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const rejectInvitation = mutation({
  args: { invitationId: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      const result = await auth.api.rejectInvitation({
        headers,
        body: {
          invitationId: args.invitationId,
        },
      });
      return { error: undefined, data: result };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const joinTeamWithPassword = mutation({
  args: {
    teamId: v.string(),
    password: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

      // Get current user
      const session = await auth.api.getSession({ headers });
      if (!session?.user?.id) {
        return { error: "User not authenticated", data: null };
      }

      // List all teams to find the target team and verify password
      const teamsRes = await auth.api.listOrganizationTeams({
        headers,
        query: { organizationId: args.organizationId },
      });

      if (!Array.isArray(teamsRes)) {
        return { error: "Failed to fetch teams", data: null };
      }

      const team = teamsRes.find((t: { id: string }) => t.id === args.teamId) as
        | { id: string; password?: string }
        | undefined;
      if (!team) {
        return { error: "Team not found", data: null };
      }

      if (!team.password) {
        return {
          error: "Team password not configured",
          data: null,
        };
      }

      // Verify password (the team should have a hashed password stored)
      const isValid = await verifyPassword({
        password: args.password,
        hash: team.password,
      });

      if (!isValid) {
        return { error: "Invalid password", data: null };
      }

      // Add user to team
      const result = await auth.api.addTeamMember({
        body: {
          teamId: args.teamId,
          userId: session.user.id,
        },
      });

      return { error: undefined, data: result };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});
