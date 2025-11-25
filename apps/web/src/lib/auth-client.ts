import { convexClient } from "@convex-dev/better-auth/client/plugins";
import {
  ac,
  admin,
  member,
  owner,
} from "@labsync/backend/convex/betterAuth/permissions";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    organizationClient({
      ac,
      roles: {
        member,
        owner,
        admin,
      },
      teams: {
        enabled: true,
      },
    }),
  ],
});
