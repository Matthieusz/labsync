import { api } from "@labsync/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
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

const MIN_PASSWORD_LENGTH = 6;

const schema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    ),
});

export function CreateTeamDialog({
  organizationId,
  onCreated,
}: {
  organizationId: string;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const createTeam = useMutation(api.teams.createTeamInOrganization);

  const form = useForm({
    defaultValues: { name: "", password: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        await createTeam({
          organizationId,
          name: value.name,
          password: value.password,
        });
        toast.success("Team created");
        setOpen(false);
        onCreated?.();
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to create team";
        toast.error(message);
      }
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button type="button" variant="default">
          <Plus />
          Create a team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new team</DialogTitle>
          <DialogDescription>
            Set a descriptive name and unique slug for your team within this
            organization.
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
                <Label htmlFor={field.name}>Team Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Platform Squad"
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
                <Label htmlFor={field.name}>Team Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter team password"
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
                  {state.isSubmitting ? "Creating..." : "Create Team"}
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
