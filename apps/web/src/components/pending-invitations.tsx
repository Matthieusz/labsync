import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { Check, Mail, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Invitation = {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName?: string;
  organizationSlug?: string;
  status: string;
  expiresAt?: Date;
  inviterId?: string;
  invitedBy?: {
    name?: string;
    email?: string;
  };
};

export function PendingInvitations() {
  const { t } = useTranslation();
  const { data: invitationsResult } = useSuspenseQuery(
    convexQuery(api.organizations.listPendingInvitations, {})
  );

  const acceptInvitation = useMutation(api.organizations.acceptInvitation);
  const rejectInvitation = useMutation(api.organizations.rejectInvitation);

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const result = await acceptInvitation({ invitationId });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("invitations.accepted"));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("invitations.failedToAccept");
      toast.error(message);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const result = await rejectInvitation({ invitationId });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("invitations.declined"));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("invitations.failedToDecline");
      toast.error(message);
    }
  };

  if (invitationsResult.error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
        <p className="font-medium">{t("invitations.failedToLoad")}</p>
        <p className="text-muted-foreground">{invitationsResult.error}</p>
      </div>
    );
  }

  const invitations: Invitation[] = Array.isArray(invitationsResult.data)
    ? (invitationsResult.data as Invitation[])
    : [];

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "pending"
  );

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 font-semibold text-xl">{t("invitations.pending")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pendingInvitations.map((invitation) => (
          <Card className="border-amber-200 bg-amber-50/50" key={invitation.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-amber-600" />
                {t("invitations.orgInvitation")}
              </CardTitle>
              <CardDescription>
                {invitation.organizationName || t("organizations.unknown")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {t("common.role")}:{" "}
                  </span>
                  <span className="font-medium capitalize">
                    {invitation.role}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("common.email")}:{" "}
                  </span>
                  <span className="font-medium">{invitation.email}</span>
                </div>
                {invitation.invitedBy && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("invitations.invitedBy")}:{" "}
                    </span>
                    <span className="font-medium">
                      {invitation.invitedBy.name || invitation.invitedBy.email}
                    </span>
                  </div>
                )}
                {invitation.expiresAt && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("common.expires")}:{" "}
                    </span>
                    <span className="font-medium">
                      {invitation.expiresAt instanceof Date
                        ? invitation.expiresAt.toLocaleDateString()
                        : new Date(invitation.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleAcceptInvitation(invitation.id)}
                  size="sm"
                  type="button"
                >
                  <Check className="h-4 w-4" />
                  {t("common.accept")}
                </Button>
                <Button
                  onClick={() => handleDeclineInvitation(invitation.id)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                  {t("common.decline")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default PendingInvitations;
