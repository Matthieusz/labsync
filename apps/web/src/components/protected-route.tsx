import { Link } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "./error-boundary";
import Loader from "./loader";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type ProtectedRouteProps = {
  children: ReactNode;
  /**
   * Custom loading component to show while auth state is being determined
   */
  loadingComponent?: ReactNode;
  /**
   * Custom component to show when user is not authenticated
   */
  unauthenticatedComponent?: ReactNode;
};

function DefaultUnauthenticated() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.signInRequired", "Sign in required")}</CardTitle>
          <CardDescription>
            {t(
              "auth.signInDescription",
              "You need to be signed in to access this page."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/">
            <Button className="w-full" variant="default">
              {t("auth.goToSignIn", "Go to Sign In")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * A wrapper component that handles authentication state for protected routes.
 *
 * Features:
 * - Shows loading state while auth is being determined
 * - Redirects/shows message for unauthenticated users
 * - Wraps children in an ErrorBoundary
 * - Provides consistent auth UX across the app
 *
 * @example
 * ```tsx
 * function DashboardRoute() {
 *   return (
 *     <ProtectedRoute>
 *       <DashboardContent />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
  children,
  loadingComponent,
  unauthenticatedComponent,
}: ProtectedRouteProps) {
  return (
    <>
      <AuthLoading>{loadingComponent ?? <Loader />}</AuthLoading>
      <Unauthenticated>
        {unauthenticatedComponent ?? <DefaultUnauthenticated />}
      </Unauthenticated>
      <Authenticated>
        <ErrorBoundary>{children}</ErrorBoundary>
      </Authenticated>
    </>
  );
}

export default ProtectedRoute;
