import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

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

// Helper to fetch members for multiple organizations in parallel with batching
async function fetchMembersForOrganizations(
  auth: {
    api: {
      listMembers: (opts: {
        headers: Headers;
        query: { organizationId: string };
      }) => Promise<{
        members?: Array<{
          role: string;
          user?: { name?: string; email?: string };
        }>;
      }>;
    };
  },
  headers: Headers,
  orgIds: string[]
): Promise<
  Map<string, Array<{ role: string; user?: { name?: string; email?: string } }>>
> {
  // Batch requests with a reasonable concurrency limit to avoid overwhelming the API
  const BATCH_SIZE = 5;
  const results = new Map<
    string,
    Array<{ role: string; user?: { name?: string; email?: string } }>
  >();

  for (let i = 0; i < orgIds.length; i += BATCH_SIZE) {
    const batch = orgIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (orgId) => {
        const membersRes = await auth.api.listMembers({
          headers,
          query: { organizationId: orgId },
        });
        return {
          orgId,
          members: Array.isArray(membersRes?.members) ? membersRes.members : [],
        };
      })
    );

    for (const { orgId, members } of batchResults) {
      results.set(orgId, members);
    }
  }

  return results;
}

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

      // Early return if no organizations
      if (orgs.length === 0) {
        return { data: [], error: undefined };
      }

      // Fetch all members in batched parallel requests
      const orgIds = orgs.map((org: { id: string }) => org.id);
      const membersMap = await fetchMembersForOrganizations(
        auth,
        headers,
        orgIds
      );

      // Map organizations with their member data
      const results = orgs.map(
        (org: { id: string; name: string; slug?: string }) => {
          const members = membersMap.get(org.id) ?? [];
          const owner = members.find((m) => m.role === "owner");
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            memberCount: members.length,
            owner: {
              name: owner?.user?.name,
              email: owner?.user?.email,
            },
          };
        }
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
