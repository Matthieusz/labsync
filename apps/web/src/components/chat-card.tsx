import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SCROLL_THRESHOLD = 100;

type ChatMessage = {
  _id: string;
  _creationTime: number;
  content: string;
  userId: string;
};

type ChatCardProps = {
  organizationId?: string;
  teamId?: string;
  userId: string;
  membersById: Record<string, string>;
  title?: string;
  height?: string;
};

function TypingIndicator({ names }: { names: string[] }) {
  const { t } = useTranslation();

  if (names.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-xs">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
      <span>
        {names.length === 1
          ? t("chat.typing", { name: names[0] })
          : t("chat.typingMultiple", { count: names.length })}
      </span>
    </div>
  );
}

function TeamChatCard({
  teamId,
  userId,
  membersById,
  title,
  height,
}: {
  teamId: string;
  userId: string;
  membersById: Record<string, string>;
  title?: string;
  height: string;
}) {
  const { data: messagesResult } = useSuspenseQuery(
    convexQuery(api.messages.getMessagesByTeam, { teamId })
  );
  const messages: ChatMessage[] = (messagesResult?.data ?? []) as ChatMessage[];
  const sendMessage = useMutation(api.messages.createMessage);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage({ content, userId, teamId });
    },
    [sendMessage, userId, teamId]
  );

  return (
    <ChatCardInner
      height={height}
      membersById={membersById}
      messages={messages}
      onSend={handleSend}
      title={title}
      userId={userId}
    />
  );
}

function OrgChatCard({
  organizationId,
  userId,
  membersById,
  title,
  height,
}: {
  organizationId: string;
  userId: string;
  membersById: Record<string, string>;
  title?: string;
  height: string;
}) {
  const { data: messagesResult } = useSuspenseQuery(
    convexQuery(api.messages.getMessagesByOrganization, { organizationId })
  );
  const messages: ChatMessage[] = (messagesResult?.data ?? []) as ChatMessage[];
  const sendMessage = useMutation(api.messages.createMessage);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage({ content, userId, organizationId });
    },
    [sendMessage, userId, organizationId]
  );

  return (
    <ChatCardInner
      height={height}
      membersById={membersById}
      messages={messages}
      onSend={handleSend}
      title={title}
      userId={userId}
    />
  );
}

function ChatCardInner({
  messages,
  userId,
  membersById,
  title,
  height,
  onSend,
}: {
  messages: ChatMessage[];
  userId: string;
  membersById: Record<string, string>;
  title?: string;
  height: string;
  onSend: (content: string) => void;
}) {
  const { t } = useTranslation();
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  // Simulated typing state - in real app, this would come from the backend
  const [typingUsers] = useState<string[]>([]);

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
      onSend(value.content);
      formApi.reset();
    },
  });

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

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
    setShowScrollButton(false);
    setHasNewMessages(false);
  }, []);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom =
      scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;

    setShowScrollButton(!isNearBottom);
    if (isNearBottom) {
      setHasNewMessages(false);
    }
  }, []);

  // Auto-scroll on new messages (only if user is near bottom)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom =
      scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
    const hadPreviousMessages = previousMessageCountRef.current > 0;
    const hasNewMessage = messages.length > previousMessageCountRef.current;

    if (hasNewMessage) {
      if (isNearBottom || !hadPreviousMessages) {
        // User is near bottom or this is initial load - scroll within container only
        container.scrollTop = container.scrollHeight;
      } else {
        // User scrolled up - show notification
        setShowScrollButton(true);
        setHasNewMessages(true);
      }
    }

    previousMessageCountRef.current = messages.length;
  }, [messages.length]);

  const displayTitle = title ?? t("chat.teamChat");

  const typingUserNames = typingUsers
    .filter((id) => id !== userId)
    .map((id) => membersById[id] ?? id);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            {displayTitle}
          </CardTitle>
          <Button
            onClick={() => setIsChatExpanded(!isChatExpanded)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {isChatExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isChatExpanded ? (
        <CardContent
          className="flex flex-col overflow-hidden pt-0"
          style={{ height }}
        >
          <div
            aria-live="polite"
            aria-relevant="additions"
            className="scrollbar-hidden relative flex flex-1 flex-col overflow-y-auto rounded-md border bg-muted/30 p-4"
            onScroll={handleScroll}
            ref={messagesContainerRef}
            role="log"
            style={{ scrollBehavior: "smooth" }}
          >
            {messages.length ? (
              <ul className="flex flex-col gap-4">
                {messages.map((msg) => {
                  const isOwn = msg.userId === userId;
                  const name = membersById[msg.userId] ?? msg.userId;
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
                <p>{t("chat.noMessages")}</p>
              </div>
            )}
            <div ref={messagesEndRef} />

            {/* Scroll to bottom button */}
            {showScrollButton ? (
              <Button
                aria-label={t("chat.scrollToBottom")}
                className="-translate-x-1/2 absolute bottom-4 left-1/2 rounded-full shadow-lg"
                onClick={scrollToBottom}
                size="sm"
                variant="secondary"
              >
                <ArrowDown className="mr-1 h-4 w-4" />
                {hasNewMessages
                  ? t("chat.newMessages")
                  : t("chat.scrollToBottom")}
              </Button>
            ) : null}
          </div>

          {/* Typing indicator */}
          <div className="mt-2 h-4">
            <TypingIndicator names={typingUserNames} />
          </div>

          <form
            aria-label="Send a message"
            className="mt-2 flex gap-2"
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
                  placeholder={t("chat.typeMessage")}
                  value={field.state.value}
                />
              )}
            </form.Field>
            <Button aria-label="Send message" size="icon" type="submit">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function ChatCard({
  organizationId,
  teamId,
  userId,
  membersById,
  title,
  height = "450px",
}: ChatCardProps) {
  if (teamId) {
    return (
      <TeamChatCard
        height={height}
        membersById={membersById}
        teamId={teamId}
        title={title}
        userId={userId}
      />
    );
  }

  if (organizationId) {
    return (
      <OrgChatCard
        height={height}
        membersById={membersById}
        organizationId={organizationId}
        title={title}
        userId={userId}
      />
    );
  }

  return null;
}
