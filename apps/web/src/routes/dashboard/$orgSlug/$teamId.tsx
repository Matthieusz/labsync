import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
} from "convex/react";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    convexQuery(api.organizations.getOrganizationMembersBySlug, { slug: orgSlug })
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

  // Chat feature for team
  const userId = context?.userId;
  const sendMessage = useMutation(api.messages.createMessage);
  const { data: messagesResult } = useSuspenseQuery(
    convexQuery(api.messages.getMessagesByTeam, { teamId })
  );

  // Derive members map for quick lookup (from org)
  const membersById =
    orgResult?.data?.members?.reduce((map: Record<string, string>, m: any) => {
      if (m.userId) {
        map[m.userId] = m.name || m.email || m.userId;
      }
      return map;
    }, {}) ?? {};

  type ChatMessage = {
    _id: string;
    _creationTime: number;
    userId: string;
    content: string;
  };
  const messages: ChatMessage[] = (messagesResult?.data || []) as ChatMessage[];

  const formatTime = (ms: number) => {
    try {
      return new Date(ms).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const form = useForm({
    defaultValues: { content: "" },
    onSubmit: ({
      value,
      formApi,
    }: {
      value: { content: string };
      formApi: { reset: () => void };
    }) => {
      if (!(value.content.trim() && userId)) {
        return;
      }
      sendMessage({
        content: value.content,
        userId,
        teamId,
      });
      formApi.reset();
    },
  });

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

          <section className="mt-8 space-y-6">
            {team ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Team name</dt>
                      <dd className="font-medium">{team.name}</dd>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Team ID</dt>
                      <dd className="font-mono text-xs sm:text-sm">
                        {team.id}
                      </dd>
                    </div>
                    {createdAtLabel && (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <dt className="text-muted-foreground">Created</dt>
                        <dd className="font-medium">{createdAtLabel}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {fallbackMessage ??
                      "Team details are currently unavailable."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Team Chat Feature */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-base">Team Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  aria-live="polite"
                  aria-relevant="additions"
                  className="scrollbar-hidden relative flex h-80 max-h-96 flex-col overflow-y-auto rounded-md border bg-muted/30 p-2"
                  role="log"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {messages.length ? (
                    <ul className="flex flex-col gap-3">
                      {messages.map((msg) => {
                        const isOwn = msg.userId === userId;
                        const name = membersById[msg.userId] || msg.userId;
                        return (
                          <li
                            className={
                              isOwn
                                ? "flex w-full justify-end"
                                : "flex w-full justify-start"
                            }
                            key={msg._id}
                          >
                            <div
                              className={
                                isOwn
                                  ? "flex max-w-[75%] flex-col items-end"
                                  : "flex max-w-[75%] flex-col items-start"
                              }
                            >
                              <div
                                className={
                                  isOwn
                                    ? "rounded-2xl bg-primary px-3 py-2 text-primary-foreground text-sm shadow-sm"
                                    : "rounded-2xl bg-white px-3 py-2 text-primary-foreground text-sm shadow-sm ring-1 ring-black/5"
                                }
                              >
                                {msg.content}
                              </div>
                              <div className="mt-1 text-[10px] text-muted-foreground">
                                {name} • {formatTime(msg._creationTime)}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>

                <form
                  aria-label="Send a message"
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  <form.Field name="content">
                    {(field) => (
                      <Input
                        aria-label="Message content"
                        autoComplete="off"
                        className="flex-1"
                        disabled={form.state.isSubmitting}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Type your message..."
                        value={field.state.value}
                      />
                    )}
                  </form.Field>
                  <Button aria-label="Send message" type="submit">
                    Send
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
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
