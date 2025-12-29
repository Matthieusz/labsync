import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // Could integrate with Sentry, LogRocket, etc.
    }
    // biome-ignore lint/suspicious/noConsole: Error logging is intentional for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[200px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">
            {t("errors.somethingWentWrong", "Something went wrong")}
          </CardTitle>
          <CardDescription>
            {t(
              "errors.errorDescription",
              "An unexpected error occurred. Please try again."
            )}
          </CardDescription>
        </CardHeader>
        {error?.message ? (
          <CardContent>
            <div className="rounded-md bg-muted p-3">
              <code className="text-muted-foreground text-sm">
                {error.message}
              </code>
            </div>
          </CardContent>
        ) : null}
        <CardFooter className="flex gap-2">
          <Button onClick={onReset} variant="outline">
            {t("common.tryAgain", "Try Again")}
          </Button>
          <Button
            onClick={() => globalThis.location.reload()}
            variant="default"
          >
            {t("common.reloadPage", "Reload Page")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export { ErrorBoundaryClass as ErrorBoundary };
