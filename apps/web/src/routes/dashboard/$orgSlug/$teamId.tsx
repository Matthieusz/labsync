import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";
import { ChatCard } from "@/components/chat-card";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserMenu from "@/components/user-menu";

type TeamSummary = {
  id: string;
  name: string;
  createdAt?: number;
};

export const Route = createFileRoute("/dashboard/$orgSlug/$teamId")({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/" });
    }
  },
  component: TeamRouteComponent,
});

function TeamRouteComponent() {
  const { orgSlug, teamId } = Route.useParams();

  const context = Route.useRouteContext?.() ?? {};

  // Team details
  const { data: orgResult } = useSuspenseQuery(
    convexQuery(api.organizations.getOrganizationMembersBySlug, {
      slug: orgSlug,
    })
  );
  const organizationId = orgResult?.data?.id ?? "";
  const organizationName = orgResult?.data?.name ?? orgSlug;

  const { data: teamsResult } = useSuspenseQuery(
    convexQuery(api.teams.listTeamsByOrganization, { organizationId })
  );
  const teamData = Array.isArray(teamsResult?.data)
    ? (teamsResult.data as TeamSummary[])
    : [];
  const team = teamData.find((candidate) => candidate.id === teamId);
  const createdAtLabel =
    typeof team?.createdAt === "number" && Number.isFinite(team.createdAt)
      ? new Date(team.createdAt).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : undefined;
  const fallbackMessage =
    team === undefined && !teamsResult?.error
      ? "We could not find this team in the selected organization."
      : undefined;

  // User context for chat
  const userId = context?.userId;

  // Derive members map for quick lookup (from org)
  type MemberType = { userId?: string; name?: string; email?: string };
  const membersById =
    orgResult?.data?.members?.reduce(
      (map: Record<string, string>, m: MemberType) => {
        if (m.userId) {
          map[m.userId] = m.name ?? m.email ?? m.userId;
        }
        return map;
      },
      {}
    ) ?? {};

  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  return (
    <>
      <Authenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="font-semibold text-2xl tracking-tight">
                Team: {team?.name ?? "Unknown team"}
              </h1>
              <p className="text-muted-foreground text-sm">
                Organization: {organizationName}
              </p>
              {teamsResult?.error && (
                <p className="text-destructive text-sm" role="alert">
                  {teamsResult.error}
                </p>
              )}
              {fallbackMessage && (
                <p className="text-muted-foreground text-sm">
                  {fallbackMessage}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <UserMenu />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              params={{ orgSlug }}
              preload="intent"
              to="/dashboard/$orgSlug"
            >
              <Button size="sm" type="button" variant="outline">
                Back to organization
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8">
              {team ? (
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Info className="h-4 w-4" />
                        Team Details
                      </CardTitle>
                      <Button
                        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        {isDetailsExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {isDetailsExpanded ? (
                    <CardContent>
                      <dl className="space-y-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <dt className="text-muted-foreground text-xs">
                            Team Name
                          </dt>
                          <dd className="font-medium">{team.name}</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                          <dt className="text-muted-foreground text-xs">
                            Team ID
                          </dt>
                          <dd className="font-mono text-xs">{team.id}</dd>
                        </div>
                        {createdAtLabel && (
                          <div className="flex flex-col gap-1">
                            <dt className="text-muted-foreground text-xs">
                              Created
                            </dt>
                            <dd className="font-medium">{createdAtLabel}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  ) : null}
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Team Details</CardTitle>
                      <Button
                        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        {isDetailsExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {isDetailsExpanded ? (
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        {fallbackMessage ??
                          "Team details are currently unavailable."}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              )}
            </div>

            {/* Team Chat Feature */}
            <div className="lg:col-span-2">
              {userId ? (
                <ChatCard
                  height="550px"
                  membersById={membersById}
                  teamId={teamId}
                  userId={userId}
                />
              ) : null}
            </div>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <h2 className="mt-8 font-bold text-2xl">
            Please log in to view team details.
          </h2>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <Loader />
      </AuthLoading>
    </>
  );
}
