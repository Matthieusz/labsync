import { api } from "@labsync/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { UserPlus } from "lucide-react";
import { useState } from "react";
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
import { handleError } from "@/lib/error-handling";

const MIN_PASSWORD_LENGTH = 6;

export function JoinTeamDialog({
  organizationId,
  orgSlug,
  teamId,
  teamName,
}: {
  organizationId: string;
  orgSlug: string;
  teamId: string;
  teamName: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const joinTeam = useMutation(api.teams.joinTeamWithPassword);

  const form = useForm({
    defaultValues: { password: "" },
    validators: {
      onSubmit: z.object({
        password: z
          .string()
          .min(
            MIN_PASSWORD_LENGTH,
            t("teams.minPasswordLength", { count: MIN_PASSWORD_LENGTH })
          ),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await joinTeam({
          teamId,
          password: value.password,
          organizationId,
        });

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        toast.success(t("teams.joined"));
        setOpen(false);

        await navigate({
          to: "/dashboard/$orgSlug/$teamId",
          params: { orgSlug, teamId },
        });
      } catch (error) {
        handleError(error, t("teams.failedToJoin"));
      }
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <UserPlus />
          {t("teams.join")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("teams.joinWithPassword", { teamName })}</DialogTitle>
          <DialogDescription>{t("teams.joinDescription")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t("teams.password")}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("teams.passwordPlaceholder")}
                  type="password"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((err) => (
                  <p className="text-destructive text-sm" key={err?.message}>
                    {err?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              {t("common.cancel")}
            </Button>
            <form.Subscribe>
              {(state) => (
                <Button
                  disabled={!state.canSubmit || state.isSubmitting}
                  type="submit"
                >
                  {state.isSubmitting ? t("common.loading") : t("teams.join")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default JoinTeamDialog;
