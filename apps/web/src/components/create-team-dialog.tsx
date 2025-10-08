import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import { useState } from "react";
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
import { authClient } from "../lib/auth-client";

const schema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase, alphanumeric, and may include hyphens"
    ),
});

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { name: "", slug: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        await authClient.organization.create({
          name: value.name,
          slug: value.slug,
        });
        toast.success("Organization created");
        setOpen(false);
        // Optionally, refetch organizations list here if you cache it
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to create organization";
        toast.error(message);
      }
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button type="button" variant="default">
          <Plus />
          Create an organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new organization</DialogTitle>
          <DialogDescription>
            Set a descriptive name and unique slug for your organization.
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
                <Label htmlFor={field.name}>Organization Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Platform Engineering"
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
          <form.Field name="slug">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Slug</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. platform-engineering"
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
                  {state.isSubmitting ? "Creating..." : "Create Organization"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTeamDialog;
