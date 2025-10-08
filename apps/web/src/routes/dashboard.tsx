import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LogIn, Plus } from "lucide-react";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const user = useSuspenseQuery(convexQuery(api.auth.getCurrentUser, {}));

  return (
    <>
      <Authenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="font-semibold text-2xl tracking-tight">
                Dashboard
              </h1>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Button type="button">
                  <Plus /> Create a team
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
          <h2 className="mt-8 font-bold text-2xl">
            Welcome back, {user?.data?.name}👋
          </h2>
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <h2 className="mt-8 font-bold text-2xl">
            To access the dashboard, please log in.
          </h2>
          <Link to="/">
            <Button type="button">
              <LogIn /> Log in
            </Button>
          </Link>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <Loader />
      </AuthLoading>
    </>
  );
}
