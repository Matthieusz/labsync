import { publicProcedure, router } from "../lib/trpc";
import { groupRouter } from "./group";
import { todoRouter } from "./todo";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	todo: todoRouter,
	group: groupRouter,
});
export type AppRouter = typeof appRouter;
