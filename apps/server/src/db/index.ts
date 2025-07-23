import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth";
import * as groupSchema from "./schema/group";

export const db = drizzle(process.env.DATABASE_URL || "", {
	schema: { ...authSchema, ...groupSchema },
});
