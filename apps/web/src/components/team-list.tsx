import { Link } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateTeamDialog } from "./create-team-dialog";
import { JoinTeamDialog } from "./join-team-dialog";
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
}: TeamListProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Joined teams */}
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            {t("teams.yourTeams")}
          </CardTitle>
          <CreateTeamDialog organizationId={organizationId} />
        </CardHeader>
        <CardContent className="flex-1">
          {joined.length > 0 ? (
            <ul className="space-y-2">
              {joined.map((team) => (
                <li
                  className="group flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                  key={team.id}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 font-medium text-primary text-xs">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{team.name}</span>
                  </div>
                  <Link
                    params={{ orgSlug, teamId: team.id }}
                    preload="intent"
                    to="/dashboard/$orgSlug/$teamId"
                  >
                    <Button
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      size="icon"
                      variant="ghost"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span className="sr-only">{t("common.open")}</span>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
              <Users className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">
                {t("teams.noTeamsJoined")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available teams to join */}
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" />
            {t("teams.availableTeams")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {available.length > 0 ? (
            <ul className="space-y-2">
              {available.map((team) => (
                <li
                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                  key={team.id}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{team.name}</span>
                  </div>
                  <JoinTeamDialog
                    organizationId={organizationId}
                    orgSlug={orgSlug}
                    teamId={team.id}
                    teamName={team.name}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
              <p className="text-muted-foreground text-sm">
                {t("teams.noTeamsAvailable")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
