import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function UserMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
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
