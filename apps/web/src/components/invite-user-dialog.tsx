import { api } from "@labsync/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InviteUserDialogProps = {
  organizationId: string;
  organizationName: string;
};

export function InviteUserDialog({
  organizationId,
  organizationName,
}: InviteUserDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const inviteUser = useMutation(api.teams.inviteMemberToOrganization);

  const inviteFormSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .email(t("organizations.validEmail"))
          .min(1, t("organizations.emailRequired")),
      }),
    [t]
  );

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = inviteFormSchema.parse(value);

        const result = await inviteUser({
          organizationId,
          email: validatedData.email,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(
            t("organizations.invitationSent", { email: validatedData.email })
          );
          setOpen(false);
          form.reset();
        }
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          const firstError = error.issues[0];
          toast.error(
            firstError?.message || t("organizations.validationError")
          );
        } else {
          const message =
            error instanceof Error
              ? error.message
              : t("organizations.failedToSend");
          toast.error(message);
        }
      }
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <UserPlus />
          {t("organizations.inviteMember")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("organizations.inviteUserTo", { name: organizationName })}
          </DialogTitle>
          <DialogDescription>
            {t("organizations.inviteDescription")}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                try {
                  inviteFormSchema.shape.email.parse(value);
                } catch (error) {
                  if (error instanceof z.ZodError) {
                    return error.issues[0]?.message;
                  }
                }
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t("common.email")}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="user@example.com"
                  type="email"
                  value={field.state.value}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <form.Subscribe>
              {(state) => (
                <Button
                  disabled={!state.canSubmit || state.isSubmitting}
                  type="submit"
                >
                  {state.isSubmitting
                    ? t("common.creating")
                    : t("organizations.sendInvitation")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InviteUserDialog;
