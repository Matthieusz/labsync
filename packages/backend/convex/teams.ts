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
