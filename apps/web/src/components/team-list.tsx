type Team = {
  id: string;
  name: string;
};

type TeamCardProps = {
  result: {
    organizationId: string;
    data: Team[];
  };
};

import CreateTeamDialog from "./create-team-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export const TeamList = ({ result }: TeamCardProps) => (
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
                <span className="font-medium">{team.name}</span>
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
