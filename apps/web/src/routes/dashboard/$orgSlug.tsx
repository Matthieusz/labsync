import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import CreateTeamDialog from "@/components/create-team-dialog";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/dashboard/$orgSlug")({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/" });
    }
  },
  component: OrgRouteComponent,
});

function OrgRouteComponent() {
  const { orgSlug } = Route.useParams();
  const { data: result } = useSuspenseQuery(
    convexQuery(api.teams.getOrganizationMembersBySlug, { slug: orgSlug })
  );
  return (
    <>
      <Authenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="font-semibold text-2xl tracking-tight">
                Organization: {result.data?.name || orgSlug}
              </h1>
              {result.error && (
                <p className="text-destructive text-sm" role="alert">
                  {result.error}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <CreateTeamDialog />
              <UserMenu />
            </div>
          </div>

          <div className="mt-6">
            <Link preload="intent" to="/dashboard">
              <Button size="sm" type="button" variant="outline">
                Back to dashboard
              </Button>
            </Link>
          </div>

          {result.data ? (
            <section className="mt-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.data.members.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No members found.
                    </p>
                  ) : (
                    <ul className="divide-y rounded-md border">
                      {result.data.members.map((m) => (
                        <li
                          className="flex flex-col gap-1 px-4 py-3 text-sm"
                          key={m.userId || m.email}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium">
                              {m.name || m.email || "Unknown"}
                            </span>
                            <span className="bg-muted px-2 py-0.5 text-xs capitalize">
                              {m.role}
                            </span>
                          </div>
                          {m.email && (
                            <span className="text-muted-foreground text-xs">
                              {m.email}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </section>
          ) : (
            <div className="mt-8 text-muted-foreground text-sm">
              No data available.
            </div>
          )}
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <h2 className="mt-8 font-bold text-2xl">
            Please log in to view organization details.
          </h2>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <Loader />
      </AuthLoading>
    </>
  );
}
