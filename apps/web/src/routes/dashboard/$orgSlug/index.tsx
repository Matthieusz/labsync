import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Slash } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalendarCard } from "@/components/calendar-card";
import { ChatCard } from "@/components/chat-card";
import { FileUpload } from "@/components/file-upload";
import Loader from "@/components/loader";
import { MemberList } from "@/components/member-list";
import { TeamList } from "@/components/team-list";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/dashboard/$orgSlug/")({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/" });
    }
  },
  component: OrgRouteComponent,
});

function OrgRouteComponent() {
  const { t } = useTranslation();
  const { orgSlug } = Route.useParams();
  const context = Route.useRouteContext();

  const { data: result } = useSuspenseQuery(
    convexQuery(api.organizations.getOrganizationMembersBySlug, {
      slug: orgSlug,
    })
  );
  const orgId = result?.data?.id || "";

  const { data: teamsSplit } = useSuspenseQuery(
    convexQuery(api.teams.listTeamsSplitByMembership, { organizationId: orgId })
  );

  const userId = context?.userId;

  // Derive members map for quick lookup
  const membersById = useMemo(() => {
    const map: Record<string, string> = {};
    if (result.data) {
      for (const m of result.data.members) {
        if (m.userId) {
          map[m.userId] = m.name ?? m.email ?? m.userId;
        }
      }
    }
    return map;
  }, [result.data]);

  return (
    <>
      <Authenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground text-sm">
                <Link
                  className="transition-colors hover:text-foreground"
                  to="/dashboard"
                >
                  {t("common.dashboard")}
                </Link>
                <Slash className="-rotate-12 h-3 w-3 opacity-50" />
                <span className="font-medium text-foreground">
                  {result.data?.name || orgSlug}
                </span>
              </div>
              <h1 className="font-semibold text-2xl tracking-tight">
                {result.data?.name || orgSlug}
              </h1>
              {result.error && (
                <p className="text-destructive text-sm" role="alert">
                  {result.error}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <UserMenu />
            </div>
          </div>

          {result.data ? (
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <TeamList
                  available={
                    (teamsSplit?.data?.available ?? []) as Array<{
                      id: string;
                      name: string;
                    }>
                  }
                  joined={
                    (teamsSplit?.data?.joined ?? []) as Array<{
                      id: string;
                      name: string;
                    }>
                  }
                  organizationId={orgId}
                  orgSlug={orgSlug}
                />

                {userId ? (
                  <FileUpload organizationId={orgSlug} userId={userId} />
                ) : null}

                {userId ? (
                  <CalendarCard organizationId={orgSlug} userId={userId} />
                ) : null}

                {userId ? (
                  <ChatCard
                    membersById={membersById}
                    organizationId={orgSlug}
                    userId={userId}
                  />
                ) : null}
              </div>

              <div className="space-y-8">
                <MemberList orgSlug={orgSlug} result={result} />
              </div>
            </div>
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
            {t("common.loginRequired")}
          </h2>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <Loader />
      </AuthLoading>
    </>
  );
}
