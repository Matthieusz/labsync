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

      const session = await auth.api.getSession({ headers });
      if (!session?.user?.id) {
        return { error: "User not authenticated", data: null };
      }

      const hashedPassword = await hashPassword(args.password);

      const teamRes = await auth.api.createTeam({
        body: {
          organizationId: args.organizationId,
          name: args.name,
          password: hashedPassword,
        },
      });

      try {
        await auth.api.addTeamMember({
          headers,
          body: {
            teamId: teamRes.id,
            userId: session.user.id,
          },
        });
      } catch (memberErr) {
        console.error("Failed to add team member:", memberErr);
        return {
          error:
            memberErr instanceof Error ? memberErr.message : String(memberErr),
          data: null,
        };
      }

      return { error: undefined, data: teamRes };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        data: null,
      };
    }
  },
});

export const listTeamsSplitByMembership = query({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

      // Fetch all teams in the organization
      const teamsRes = await auth.api.listOrganizationTeams({
        headers,
        query: { organizationId: args.organizationId },
      });

      const allTeams: Array<{
        id: string;
        name: string;
        createdAt?: number;
      }> = Array.isArray(teamsRes)
        ? teamsRes.map(
            (team: { id: string; name: string; createdAt?: Date }) => ({
              id: team.id,
              name: team.name,
              createdAt:
                team.createdAt instanceof Date
                  ? team.createdAt.getTime()
                  : undefined,
            })
          )
        : [];

      // Fetch teams for the current user and intersect by team id to classify
      const userTeamsRes = await auth.api.listUserTeams({ headers });
      const userTeams: Array<{ id: string }> = Array.isArray(userTeamsRes)
        ? (userTeamsRes as Array<{ id: string }>)
        : [];
      const userTeamIds = new Set(userTeams.map((t) => t.id));

      const joined = allTeams.filter((t) => userTeamIds.has(t.id));
      const available = allTeams.filter((t) => !userTeamIds.has(t.id));

      return { error: undefined, data: { joined, available } };
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

      const session = await auth.api.getSession({ headers });
      if (!session?.user?.id) {
        return { error: "User not authenticated", data: null };
      }

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

      const isValid = await verifyPassword({
        password: args.password,
        hash: team.password,
      });

      if (!isValid) {
        return { error: "Invalid password", data: null };
      }

      const result = await auth.api.addTeamMember({
        headers,
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
