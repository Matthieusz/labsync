import { api } from "@labsync/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { UserPlus } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";

const MIN_PASSWORD_LENGTH = 6;

const passwordOnlySchema = z.object({
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    ),
});

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
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const joinTeam = useMutation(api.teams.joinTeamWithPassword);

  const form = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: passwordOnlySchema },
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

        // Set active organization before navigating
        const setActiveResult = await authClient.organization.setActive({
          organizationId,
          organizationSlug: orgSlug,
        });

        if (setActiveResult.error) {
          toast.error(
            setActiveResult.error.message || "Failed to set active organization"
          );
          return;
        }

        toast.success("Successfully joined team");
        setOpen(false);

        // Redirect to the team page
        await navigate({
          to: "/dashboard/$orgSlug/$teamId",
          params: { orgSlug, teamId },
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to join team";
        toast.error(message);
      }
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <UserPlus />
          Join
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join {teamName}</DialogTitle>
          <DialogDescription>
            Enter the team password to join this team.
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
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
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
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <form.Subscribe>
              {(state) => (
                <Button
                  disabled={!state.canSubmit || state.isSubmitting}
                  type="submit"
                >
                  {state.isSubmitting ? "Joining..." : "Join Team"}
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
