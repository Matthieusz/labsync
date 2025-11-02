import { Link } from "@tanstack/react-router";
import CreateTeamDialog from "./create-team-dialog";
import JoinTeamDialog from "./join-team-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Team = {
  id: string;
  name: string;
};

type TeamListProps = {
  orgSlug: string;
  result: {
    organizationId: string;
    data: Team[];
  };
};

export const TeamList = ({ orgSlug, result }: TeamListProps) => (
  <Card>
    <CardHeader className="flex items-center justify-between">
      <CardTitle className="text-base">Your Teams</CardTitle>
      <CreateTeamDialog organizationId={result.organizationId} />
    </CardHeader>
    <CardContent>
      {Array.isArray(result.data) && result.data.length > 0 ? (
        <ul className="divide-y rounded-md border">
          {result.data.map((team) => (
            <li className="flex flex-col gap-1 px-4 py-3 text-sm" key={team.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  params={{ orgSlug, teamId: team.id }}
                  preload="intent"
                  to="/dashboard/$orgSlug/$teamId"
                >
                  {team.name}
                </Link>
                <JoinTeamDialog
                  organizationId={result.organizationId}
                  orgSlug={orgSlug}
                  teamId={team.id}
                  teamName={team.name}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          You are not a member of any teams.
        </p>
      )}
    </CardContent>
  </Card>
);
