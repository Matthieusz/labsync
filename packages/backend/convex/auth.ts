import type { GenericCtx } from "@convex-dev/better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins/organization";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL as string;

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  }
);
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) =>
  betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    baseUrl: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex(),
      organization({
        teams: {
          enabled: true,
        },
      }),
    ],
  });

export async function getAuthUser(
  ctx: GenericCtx<DataModel>
): Promise<{ _id: string } | null> {
  try {
    return await authComponent.getAuthUser(ctx);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthenticated") {
      return null;
    }
    throw err;
  }
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => getAuthUser(ctx),
});
