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
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CreateTeamDialog from "@/components/create-team-dialog";
import Loader from "@/components/loader";
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

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (container) {
      try {
        container.scrollTo({ top: container.scrollHeight, behavior });
      } catch {
        // Fallback for environments without smooth options
        container.scrollTop = container.scrollHeight;
      }
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const lastMessageId = messages.at(-1)?._id;

  // Ensure we start from the latest message on initial load/refresh
  const didInitialScroll = useRef(false);
  useEffect(() => {
    if (
      !didInitialScroll.current &&
      messages.length > 0 &&
      scrollContainerRef.current
    ) {
      // Wait for layout to settle to ensure measurements are correct
      const scrollToLatest = () => {
        scrollToBottom("auto");
        didInitialScroll.current = true;
      };

      // Multiple strategies to ensure reliable scroll to bottom
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(scrollToLatest);
        });
      });

      // Fallback timeout in case RAF doesn't work
      const timeoutId = setTimeout(scrollToLatest, SCROLL_DELAY_MS);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, scrollToBottom]);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [forceScroll, setForceScroll] = useState(false);
  const NEAR_BOTTOM_PX = 80;
  const SCROLL_DELAY_MS = 100;

  const evaluateNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) {
      return true;
    }
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance <= NEAR_BOTTOM_PX;
  }, []);

  const handleScroll = useCallback(() => {
    setIsNearBottom(evaluateNearBottom());
  }, [evaluateNearBottom]);

  useEffect(() => {
    setIsNearBottom(evaluateNearBottom());
  }, [evaluateNearBottom]);

  useEffect(() => {
    if (!lastMessageId) {
      return;
    }
    if (forceScroll || isNearBottom) {
      scrollToBottom("smooth");
      if (forceScroll) {
        setForceScroll(false);
      }
    }
  }, [lastMessageId, forceScroll, isNearBottom, scrollToBottom]);

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

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-base">Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    aria-live="polite"
                    aria-relevant="additions"
                    className="scrollbar-hidden relative flex h-80 max-h-96 flex-col overflow-y-auto rounded-md border bg-muted/30 p-2"
                    onScroll={handleScroll}
                    ref={scrollContainerRef}
                    role="log"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {!isNearBottom && messages.length > 0 ? (
                      <div className="sticky bottom-2 z-10 flex justify-center">
                        <Button
                          aria-label="Scroll to latest messages"
                          className="shadow"
                          onClick={() => scrollToBottom("smooth")}
                          size="icon"
                          type="button"
                        >
                          <ArrowDown />
                        </Button>
                      </div>
                    ) : null}

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
                        <li aria-hidden="true" className="m-0 h-px p-0">
                          <div ref={bottomRef} />
                        </li>
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
                      setForceScroll(true);
                      form.handleSubmit();
                      scrollToBottom("smooth");
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
