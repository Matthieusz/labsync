import { Users } from "lucide-react";
import InviteUserDialog from "./invite-user-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
};

export const MemberList = ({ result, orgSlug }: MembersCardProps) => (
  <Card className="flex flex-col">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Members
        </CardTitle>
        <InviteUserDialog
          organizationId={result.data.id}
          organizationName={result.data.name || orgSlug}
        />
      </div>
    </CardHeader>
    <CardContent className="flex-1">
      {result.data.members.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
          <Users className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No members found.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {result.data.members.map((m) => {
            const displayName = m.name || m.email || "Unknown";
            const initials = displayName.substring(0, 2).toUpperCase();
            return (
              <li
                className="flex items-center justify-between gap-3"
                key={m.userId || m.email}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
                    {initials}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium text-sm">
                      {displayName}
                    </span>
                    {m.email && (
                      <span className="truncate text-muted-foreground text-xs">
                        {m.email}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground text-xs capitalize">
                  {m.role}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </CardContent>
  </Card>
);
