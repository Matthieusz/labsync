import { api } from "@labsync/backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function UserMenu() {
  const navigate = useNavigate();
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <div className="flex items-center gap-2">
      <p className="font-medium">{user?.name}</p>
      <Button
        onClick={() => {
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                navigate({
                  to: "/dashboard",
                });
              },
            },
          });
        }}
        variant="destructive"
      >
        <LogOut />
        Log out
      </Button>
    </div>
  );
}
