import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/auth-client";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "./ui/button";

export default function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher />
      {user && (
        <div className="mr-2 flex flex-col items-end text-right">
          <span className="font-medium text-sm">{user.name}</span>
          <span className="text-muted-foreground text-xs">{user.email}</span>
        </div>
      )}
      <Button
        onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                navigate({
                  to: "/",
                });
              },
            },
          });
        }}
        variant="destructive"
      >
        <LogOut />
        {t("common.logout")}
      </Button>
    </div>
  );
}
