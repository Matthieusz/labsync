import { api } from "@labsync/backend/convex/_generated/api";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Authenticated, AuthLoading, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const privateData = useQuery(api.privateData.get);

  return (
    <>
      <Authenticated>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="font-semibold text-2xl tracking-tight">
                Dashboard
              </h1>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline">
                  TEST
                </Button>
                <Button type="button">TEST 2</Button>
                <UserMenu />
              </div>
            </div>
          </div>

          {/* Private data call */}
          <div className="mt-8">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Welcome back</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {privateData ? (
                  <p className="text-sm">privateData: {privateData.message}</p>
                ) : (
                  <Skeleton className="h-5 w-64" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Authenticated>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
    </>
  );
}
