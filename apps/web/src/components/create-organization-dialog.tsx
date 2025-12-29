import { api } from "@labsync/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
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
import { handleError } from "@/lib/error-handling";

const SLUG_REGEX = /^[a-z0-9-]+$/;

export function CreateOrganizationDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const createOrganization = useMutation(api.organizations.createOrganization);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("organizations.nameMinLength")),
        slug: z
          .string()
          .min(2, t("organizations.slugMinLength"))
          .regex(SLUG_REGEX, t("organizations.slugRegex")),
      }),
    [t]
  );

  const form = useForm({
    defaultValues: { name: "", slug: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        await createOrganization({
          name: value.name,
          slug: value.slug,
        });
        toast.success(t("organizations.created"));
        setOpen(false);
      } catch (error) {
        handleError(error, t("organizations.failedToCreate"));
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
        <Button type="button" variant="default">
          <Plus />
          {t("organizations.create")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("organizations.createNew")}</DialogTitle>
          <DialogDescription>
            {t("organizations.createDescription")}
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
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t("organizations.name")}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("organizations.namePlaceholder")}
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
          <form.Field name="slug">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t("organizations.slug")}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("organizations.slugPlaceholder")}
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
            <form.Subscribe>
              {(state) => (
                <Button
                  disabled={!state.canSubmit || state.isSubmitting}
                  type="submit"
                >
                  {state.isSubmitting
                    ? t("common.creating")
                    : t("organizations.create")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateOrganizationDialog;
