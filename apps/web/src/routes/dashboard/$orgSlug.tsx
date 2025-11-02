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
import { useCallback, useMemo } from "react";
import Loader from "@/components/loader";
import { MemberList } from "@/components/member-list";
import { TeamList } from "@/components/team-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const context = Route.useRouteContext();

  const { data: result } = useSuspenseQuery(
    convexQuery(api.teams.getOrganizationMembersBySlug, { slug: orgSlug })
  );
  const orgId = result?.data?.id || "";

  const { data: userTeamsRaw } = useSuspenseQuery(
    convexQuery(api.teams.listTeamsByOrganization, { organizationId: orgId })
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
              <MemberList orgSlug={orgSlug} result={result} />
              <TeamList
                result={{
                  data: userTeamsRaw?.data ?? [],
                  organizationId: orgId,
                }}
              />

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-base">Chat</CardTitle>
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
