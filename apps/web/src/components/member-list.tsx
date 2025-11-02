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
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">Members</CardTitle>
        <InviteUserDialog
          organizationId={result.data.id}
          organizationName={result.data.name || orgSlug}
        />
      </div>
    </CardHeader>
    <CardContent>
      {result.data.members.length === 0 ? (
        <p className="text-muted-foreground text-sm">No members found.</p>
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
                <span className="text-muted-foreground text-xs">{m.email}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
