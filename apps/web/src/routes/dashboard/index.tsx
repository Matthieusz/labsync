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
import {
  ArrowRight,
  Building2,
  FlaskConical,
  LogIn,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import CreateOrganizationDialog from "@/components/create-organization-dialog";
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
  const { t } = useTranslation();
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
          {/* App Logo */}
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <Link
              className="flex items-center gap-2 transition-colors hover:opacity-80"
              to="/dashboard"
            >
              <FlaskConical className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">LabSync</span>
            </Link>
            <UserMenu />
          </div>
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="font-semibold text-2xl tracking-tight">
                {t("common.dashboard")}
              </h1>
            </div>
          </div>

          {/* Pending Invitations */}
          <PendingInvitations />

          {/* Organizations List */}
          <section className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-semibold text-xl tracking-tight">
                {t("organizations.yourOrganizations")}
              </h2>
              <CreateOrganizationDialog />
            </div>
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
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/30 p-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="max-w-sm space-y-1">
                  <p className="font-medium text-lg">
                    {t("organizations.noOrganizations")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("organizations.createFirst")}
                  </p>
                </div>
                <CreateOrganizationDialog />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orgList.map((org) => {
                  const ownerLabel =
                    org.owner?.name || org.owner?.email || "Unknown";
                  return (
                    <Card
                      className="group relative flex flex-col overflow-hidden p-0 transition-all hover:border-primary/20 hover:shadow-lg"
                      key={org.id}
                    >
                      <div className="absolute inset-x-0 top-0 h-1 from-primary/40 via-primary/60 to-primary opacity-75" />
                      <CardHeader className="px-6 pt-6 pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="rounded-lg bg-primary/10 p-2.5 ring-1 ring-primary/20">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          {org.slug && (
                            <Button
                              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                              disabled={loadingOrgId === org.id}
                              onClick={() =>
                                handleOpenOrganization(org.id, org.slug || "")
                              }
                              size="icon"
                              variant="ghost"
                            >
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">
                                {t("common.open")}
                              </span>
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1 pt-3">
                          <CardTitle className="line-clamp-1 font-semibold text-lg tracking-tight">
                            {org.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-1 font-mono text-muted-foreground/80 text-xs">
                            /{org.slug}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 px-6 pb-4">
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                          <div className="flex items-center gap-2 rounded-full bg-muted/50 px-2.5 py-1 font-medium text-xs">
                            <Users className="h-3.5 w-3.5" />
                            <span>
                              {typeof org.memberCount === "number"
                                ? t("organizations.members", {
                                    count: org.memberCount,
                                  })
                                : t("organizations.unknownMembers")}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/10 py-3">
                        <div className="flex w-full items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">
                            {t("organizations.owner")}
                          </span>
                          <span
                            className="max-w-[120px] truncate font-medium text-foreground/80"
                            title={ownerLabel}
                          >
                            {ownerLabel}
                          </span>
                        </div>
                      </CardFooter>
                      {org.slug && (
                        <button
                          className="absolute inset-0 z-10 cursor-pointer"
                          disabled={loadingOrgId === org.id}
                          onClick={() =>
                            handleOpenOrganization(org.id, org.slug || "")
                          }
                          type="button"
                        >
                          <span className="sr-only">Open {org.name}</span>
                        </button>
                      )}
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
            {t("common.loginRequired")}
          </h2>
          <Link to="/">
            <Button type="button">
              <LogIn /> {t("common.login")}
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
