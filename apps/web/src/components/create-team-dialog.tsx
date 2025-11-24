import { api } from "@labsync/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
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

const MIN_PASSWORD_LENGTH = 6;

export function CreateTeamDialog({
  organizationId,
  onCreated,
}: {
  organizationId: string;
  onCreated?: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const createTeam = useMutation(api.teams.createTeamInOrganization);

  const form = useForm({
    defaultValues: { name: "", password: "" },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, t("teams.nameMinLength")),
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
        await createTeam({
          organizationId,
          name: value.name,
          password: value.password,
        });
        toast.success(t("teams.created"));
        setOpen(false);
        onCreated?.();
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : t("teams.failedToCreate");
        toast.error(message);
      }
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button type="button" variant="default">
          <Plus />
          {t("teams.create")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("teams.createNew")}</DialogTitle>
          <DialogDescription>{t("teams.createDescription")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t("teams.name")}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("teams.namePlaceholder")}
                  value={field.state.value}
                />
                {field.state.meta.errors.map((err) => (
                  <p className="text-red-500 text-sm" key={err?.message}>
                    {err?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
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
                  <p className="text-red-500 text-sm" key={err?.message}>
                    {err?.message}
                  </p>
                ))}
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
                    : t("teams.create")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
