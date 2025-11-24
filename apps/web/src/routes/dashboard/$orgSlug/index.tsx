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
import { ArrowRight, MessageSquare, Slash } from "lucide-react";
import { useCallback, useMemo } from "react";
import { CalendarCard } from "@/components/calendar-card";
import { FileUpload } from "@/components/file-upload";
import Loader from "@/components/loader";
import { MemberList } from "@/components/member-list";
import { TeamList } from "@/components/team-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const { data: messagesResult } = useSuspenseQuery(
    convexQuery(api.messages.getMessagesByOrganization, {
      organizationId: orgSlug,
    })
  );

  const userId = context?.userId;

  const sendMessage = useMutation(api.messages.createMessage);

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
        organizationId: orgSlug,
      });
      formApi.reset();
    },
  });

  // Derive members map for quick lookup
  const membersById = useMemo(() => {
    const map: Record<string, string> = {};
    if (result.data) {
      for (const m of result.data.members) {
        if (m.userId) {
          map[m.userId] = m.name || m.email || m.userId;
        }
      }
    }
    return map;
  }, [result.data]);

  type ChatMessage = {
    _id: string;
    _creationTime: number;
    userId: string;
    content: string;
  };

  const messages: ChatMessage[] = (messagesResult?.data || []) as ChatMessage[];

  const formatTime = useCallback((ms: number) => {
    try {
      return new Date(ms).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, []);

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
                  Dashboard
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
                  <CalendarCard organizationId={orgSlug} userId={userId} />
                ) : null}

                <Card className="flex h-[500px] flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-4 w-4" />
                      Team Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col overflow-hidden pt-0">
                    <div
                      aria-live="polite"
                      aria-relevant="additions"
                      className="scrollbar-hidden relative flex flex-1 flex-col overflow-y-auto rounded-md border bg-muted/30 p-4"
                      role="log"
                      style={{ scrollBehavior: "smooth" }}
                    >
                      {messages.length ? (
                        <ul className="flex flex-col gap-4">
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
                                      ? "flex max-w-[85%] flex-col items-end"
                                      : "flex max-w-[85%] flex-col items-start"
                                  }
                                >
                                  <div
                                    className={
                                      isOwn
                                        ? "rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-primary-foreground text-sm shadow-sm"
                                        : "rounded-2xl rounded-tl-sm bg-background px-4 py-2 text-foreground text-sm shadow-sm ring-1 ring-border"
                                    }
                                  >
                                    {msg.content}
                                  </div>
                                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span className="font-medium">{name}</span>
                                    <span>•</span>
                                    <span>{formatTime(msg._creationTime)}</span>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground text-sm">
                          <MessageSquare className="h-8 w-8 opacity-20" />
                          <p>No messages yet</p>
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
                      <Button
                        aria-label="Send message"
                        size="icon"
                        type="submit"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                {userId ? (
                  <FileUpload organizationId={orgSlug} userId={userId} />
                ) : null}
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
