import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/groups")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Outlet />
		</div>
	);
}
