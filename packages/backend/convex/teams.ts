import { query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

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
      // For each org, fetch members and find the owner
      const results = await Promise.all(
        orgs.map(async (org: { id: string; name: string; slug?: string }) => {
          const membersRes = await auth.api.listMembers({
            headers,
            query: { organizationId: org.id },
          });
          const arr = Array.isArray(membersRes?.members)
            ? membersRes.members
            : [];
          const owner = arr.find(
            (m: { role: string; user?: { name?: string; email?: string } }) =>
              m.role === "owner"
          );
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
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
