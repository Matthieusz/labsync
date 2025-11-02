import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CreateTeamDialog from "@/components/create-organization-dialog";
import Loader from "@/components/loader";
import PendingInvitations from "@/components/pending-invitations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserMenu from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null);
  const { data: orgs } = useSuspenseQuery(
    convexQuery(api.organizations.listOrganizationsWithOwners, {})
  );
  const orgList = orgs.data;

  const handleOpenOrganization = async (orgId: string, orgSlug: string) => {
    setLoadingOrgId(orgId);
    try {
      const result = await authClient.organization.setActive({
        organizationId: orgId,
        organizationSlug: orgSlug,
      });

      if (result.error) {
        toast.error(
          result.error.message || "Failed to set active organization"
        );
        return;
      }

      await navigate({
        to: "/dashboard/$orgSlug",
        params: { orgSlug },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to open organization"
      );
    } finally {
      setLoadingOrgId(null);
    }
  };

  return (
    <>
      <Authenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="font-semibold text-2xl tracking-tight">
                Dashboard
              </h1>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <CreateTeamDialog />
                <UserMenu />
              </div>
            </div>
          </div>

          {/* Pending Invitations */}
          <PendingInvitations />

          {/* Organizations List */}
          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-xl">Your Organizations</h2>
            {/* Error handling */}
            {orgs.error && (
              <div
                className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm"
                role="alert"
              >
                <p className="font-medium">Failed to load owner data</p>
                <p className="text-muted-foreground">{orgs.error}</p>
              </div>
            )}
            {orgList.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed p-8 text-sm">
                <div>
                  <p className="font-medium">No organizations yet</p>
                  <p className="text-muted-foreground">
                    Create your first organization to get started.
                  </p>
                </div>
                <CreateTeamDialog />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orgList.map((org) => {
                  const ownerLabel =
                    org.owner?.name || org.owner?.email || "Unknown";
                  return (
                    <Card
                      className="transition-colors hover:border-foreground/30"
                      key={org.id}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                          <span className="truncate" title={org.name}>
                            {org.name}
                          </span>
                          {org.slug && (
                            <span className="font-normal text-muted-foreground text-xs">
                              /{org.slug}
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {ownerLabel === "Unknown"
                            ? "Owner unavailable"
                            : `Owned by ${ownerLabel}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <dl className="grid grid-cols-1 gap-3 text-xs">
                          <div className="flex flex-col gap-0.5">
                            <dt className="text-muted-foreground">Name</dt>
                            <dd className="wrap-break-word font-medium">
                              {org.name}
                            </dd>
                          </div>
                          {org.slug && (
                            <div className="flex flex-col gap-0.5">
                              <dt className="text-muted-foreground">Slug</dt>
                              <dd className="font-mono text-[11px]">
                                {org.slug}
                              </dd>
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <dt className="text-muted-foreground">Owner</dt>
                            <dd className="wrap-break-word font-medium">
                              {ownerLabel}
                            </dd>
                          </div>
                          {typeof org.memberCount === "number" && (
                            <div className="flex flex-col gap-0.5">
                              <dt className="text-muted-foreground">Members</dt>
                              <dd className="font-medium">{org.memberCount}</dd>
                            </div>
                          )}
                        </dl>
                      </CardContent>
                      <CardFooter className="justify-end">
                        <div className="flex gap-2">
                          {org.slug ? (
                            <Button
                              disabled={loadingOrgId === org.id}
                              onClick={() =>
                                handleOpenOrganization(org.id, org.slug || "")
                              }
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              {loadingOrgId === org.id ? "Opening..." : "Open"}
                            </Button>
                          ) : (
                            <Button
                              disabled
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              Open
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <h2 className="mt-8 font-bold text-2xl">
            To access the dashboard, please log in.
          </h2>
          <Link to="/">
            <Button type="button">
              <LogIn /> Log in
            </Button>
          </Link>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <Loader />
      </AuthLoading>
    </>
  );
}
