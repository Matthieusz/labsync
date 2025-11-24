import { convexQuery } from "@convex-dev/react-query";
import { api } from "@labsync/backend/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad({ context }) {
    if (context.userId) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

const TITLE_TEXT = `
 ██╗      █████╗ ██████╗ ███████╗██╗   ██╗███╗   ██╗ ██████╗
 ██║     ██╔══██╗██╔══██╗██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
 ██║     ███████║██████╔╝███████╗ ╚████╔╝ ██╔██╗ ██║██║     
 ██║     ██╔══██║██╔══██╗╚════██║  ╚██╔╝  ██║╚██╗██║██║     
 ███████╗██║  ██║██████╔╝███████║   ██║   ██║ ╚████║╚██████╗
 ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝
`;

function HomeComponent() {
  const { t } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);
  const healthCheck = useQuery(convexQuery(api.healthCheck.get, {}));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto text-center font-mono text-sm">
        {TITLE_TEXT}
      </pre>
      <div className="mt-8 grid flex-col items-center justify-center gap-2 md:flex">
        <section className="w-32 rounded-lg border p-4">
          <h2 className="mb-2 font-medium">{t("home.apiStatus")}</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data === "OK" ? "bg-green-500" : healthCheck.isLoading ? "bg-orange-400" : "bg-red-500"}`}
            />
            <span className="text-muted-foreground text-sm">
              {healthCheck.isLoading
                ? t("home.checking")
                : healthCheck.data === "OK"
                  ? t("home.connected")
                  : t("home.error")}
            </span>
          </div>
        </section>
        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </div>
    </div>
  );
}
