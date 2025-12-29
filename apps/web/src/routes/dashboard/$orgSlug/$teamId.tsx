import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { ChatCard } from "@/components/chat-card";
import { FileUpload } from "@/components/file-upload";
import Loader from "@/components/loader";
import { MemberList } from "@/components/member-list";
import { Button } from "@/components/ui/button";
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
  const _createdAtLabel =
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

  const [_isDetailsExpanded, _setIsDetailsExpanded] = useState(true);

  return (
    <>
      <Authenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <Link
              className="flex items-center gap-2 transition-colors hover:opacity-80"
              to="/dashboard"
            >
              <FlaskConical className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">LabSync</span>
            </Link>
            <UserMenu />
          </div>
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
            <div className="space-y-8 lg:col-span-2">
              {userId ? (
                <FileUpload organizationId={organizationId} userId={userId} />
              ) : null}

              {/* Team Chat Feature */}
              {userId ? (
                <ChatCard
                  height="550px"
                  membersById={membersById}
                  teamId={teamId}
                  userId={userId}
                />
              ) : null}
            </div>

            <div className="space-y-8">
              {orgResult.data ? (
                <MemberList
                  orgSlug={orgSlug}
                  result={{ data: orgResult.data }}
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
