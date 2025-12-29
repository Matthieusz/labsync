import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import InviteUserDialog from "./invite-user-dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";

type Member = {
  userId?: string;
  email?: string;
  name?: string;
  role: string;
};

type MembersCardProps = {
  result: {
    data: {
      id: string;
      name?: string;
      members: Member[];
    };
  };
  orgSlug: string;
  isLoading?: boolean;
};

type RoleFilter = "all" | "owner" | "admin" | "member";
type SortField = "name" | "role";
type SortDirection = "asc" | "desc";

// Role priority for sorting (owner > admin > member)
const ROLE_PRIORITY: Record<string, number> = {
  owner: 0,
  admin: 1,
  member: 2,
};
const UNKNOWN_ROLE_PRIORITY = 99;

function getRoleBadgeVariant(
  role: string
): "default" | "secondary" | "outline" {
  switch (role.toLowerCase()) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

// Empty state component for the member list
function MemberListEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground text-sm">
      <Icon className="h-10 w-10 opacity-20" />
      <p className="font-medium">{title}</p>
      <p className="text-xs">{description}</p>
    </div>
  );
}

// Skeleton loading state - stable IDs for skeleton items
const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3"] as const;

function MemberListSkeleton() {
  return (
    <div className="space-y-3 p-2">
      {SKELETON_IDS.map((id) => (
        <div className="flex items-center gap-3" key={id}>
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Member list item component - memoized for performance in lists
const MemberListItem = memo(function MemberListItemInner({
  member,
}: {
  member: Member;
}) {
  const displayName = member.name || member.email || "Unknown";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <li className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-all hover:bg-accent/50 hover:shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-medium text-sm" title={displayName}>
            {displayName}
          </span>
          {member.email && (
            <span
              className="truncate text-muted-foreground text-xs"
              title={member.email}
            >
              {member.email}
            </span>
          )}
        </div>
      </div>
      <Badge
        className="shrink-0 capitalize"
        variant={getRoleBadgeVariant(member.role)}
      >
        {member.role}
      </Badge>
    </li>
  );
});

// Member list content component
function MemberListContent({
  members,
  filteredAndSortedMembers,
  t,
  isLoading,
}: {
  members: Member[];
  filteredAndSortedMembers: Member[];
  t: (key: string) => string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <MemberListSkeleton />;
  }

  if (members.length === 0) {
    return (
      <MemberListEmptyState
        description={t("organizations.invite")}
        icon={Users}
        title={t("organizations.noMembers")}
      />
    );
  }

  if (filteredAndSortedMembers.length === 0) {
    return (
      <MemberListEmptyState
        description={t("members.tryDifferentFilter")}
        icon={Search}
        title={t("members.noResults")}
      />
    );
  }

  return (
    <ul className="h-full max-h-80 space-y-2 overflow-y-auto p-2">
      {filteredAndSortedMembers.map((member) => (
        <MemberListItem key={member.userId || member.email} member={member} />
      ))}
    </ul>
  );
}

export const MemberList = ({
  result,
  orgSlug,
  isLoading = false,
}: MembersCardProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("all");
  const [sortField, setSortField] = useState<SortField>("role");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const members = result.data.members;

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = [...members];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name?.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((m) => m.role.toLowerCase() === filterRole);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name": {
          const nameA = a.name || a.email || "";
          const nameB = b.name || b.email || "";
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "role": {
          const priorityA =
            ROLE_PRIORITY[a.role.toLowerCase()] ?? UNKNOWN_ROLE_PRIORITY;
          const priorityB =
            ROLE_PRIORITY[b.role.toLowerCase()] ?? UNKNOWN_ROLE_PRIORITY;
          comparison = priorityA - priorityB;
          break;
        }
        default:
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [members, searchQuery, filterRole, sortField, sortDirection]);

  const roleLabels: Record<RoleFilter, string> = {
    all: t("members.allRoles"),
    owner: t("members.owner"),
    admin: t("members.admin"),
    member: t("members.member"),
  };

  const sortLabels: Record<SortField, string> = {
    name: t("members.sortByName"),
    role: t("members.sortByRole"),
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t("organizations.membersTitle")}
              </CardTitle>
              {members.length > 0 && (
                <CardDescription className="text-xs">
                  {t("organizations.members_other", { count: members.length })}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <InviteUserDialog
              organizationId={result.data.id}
              organizationName={result.data.name || orgSlug}
            />
            <Button
              aria-label={
                isExpanded ? t("common.collapse") : t("common.expand")
              }
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded ? (
        <CardContent className="flex flex-1 flex-col gap-4">
          {/* Search and Filter Bar */}
          {members.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("members.searchPlaceholder")}
                  value={searchQuery}
                />
                {searchQuery && (
                  <Button
                    className="-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6"
                    onClick={() => setSearchQuery("")}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shrink-0" size="sm" variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {roleLabels[filterRole]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {t("members.filterByRole")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    onValueChange={(value) =>
                      setFilterRole(value as RoleFilter)
                    }
                    value={filterRole}
                  >
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <DropdownMenuRadioItem key={key} value={key}>
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shrink-0" size="sm" variant="outline">
                    {sortDirection === "asc" ? (
                      <SortAsc className="mr-2 h-4 w-4" />
                    ) : (
                      <SortDesc className="mr-2 h-4 w-4" />
                    )}
                    {sortLabels[sortField]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("members.sortBy")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    onValueChange={(value) => setSortField(value as SortField)}
                    value={sortField}
                  >
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <DropdownMenuRadioItem key={key} value={key}>
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    onValueChange={(value) =>
                      setSortDirection(value as SortDirection)
                    }
                    value={sortDirection}
                  >
                    <DropdownMenuRadioItem value="asc">
                      {t("members.ascending")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">
                      {t("members.descending")}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Member List */}
          <div className="max-h-80 flex-1 overflow-hidden rounded-lg border bg-muted/20">
            <MemberListContent
              filteredAndSortedMembers={filteredAndSortedMembers}
              isLoading={isLoading}
              members={members}
              t={t}
            />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
};
