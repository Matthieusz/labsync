import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

// Extend the default organization statements to include team permissions.
// Avoid duplicating the `team` key by omitting it from the defaults first.
const { team: _omitTeam, ...baseStatements } = defaultStatements as Record<
  string,
  readonly string[]
>;

export const statement = {
  ...baseStatements,
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
} as const);

export const admin = ac.newRole({
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
} as const);

// Override the default member role to allow creating teams
export const member = ac.newRole({
  team: ["create", "update"],
});

export type AccessController = typeof ac;
