import { Link } from "@tanstack/react-router";
import CreateTeamDialog from "./create-team-dialog";
import JoinTeamDialog from "./join-team-dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Team = {
  id: string;
  name: string;
};

type TeamListProps = {
  orgSlug: string;
  organizationId: string;
  joined: Team[];
  available: Team[];
};

export const TeamList = ({
  orgSlug,
  organizationId,
  joined,
  available,
}: TeamListProps) => (
  <div className="grid gap-6 md:grid-cols-2">
    {/* Joined teams */}
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">Your Teams</CardTitle>
        <CreateTeamDialog organizationId={organizationId} />
      </CardHeader>
      <CardContent>
        {joined.length > 0 ? (
          <ul className="divide-y rounded-md border">
            {joined.map((team) => (
              <li
                className="flex flex-col gap-1 px-4 py-3 text-sm"
                key={team.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{team.name}</span>
                  <Link
                    params={{ orgSlug, teamId: team.id }}
                    preload="intent"
                    to="/dashboard/$orgSlug/$teamId"
                  >
                    <Button size="sm" type="button" variant="outline">
                      Open
                    </Button>
                  </Link>
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

    {/* Available teams to join */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Available Teams</CardTitle>
      </CardHeader>
      <CardContent>
        {available.length > 0 ? (
          <ul className="divide-y rounded-md border">
            {available.map((team) => (
              <li
                className="flex flex-col gap-1 px-4 py-3 text-sm"
                key={team.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{team.name}</span>
                  <JoinTeamDialog
                    organizationId={organizationId}
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
            No other teams available to join.
          </p>
        )}
      </CardContent>
    </Card>
  </div>
);
