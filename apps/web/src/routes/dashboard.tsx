import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import GroupForm from "@/components/dashboard/group-form";
import GroupList from "@/components/dashboard/group-list";
import Header from "@/components/dashboard/header";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!session && !isPending) {
			navigate({
				to: "/login",
			});
		}
	}, [session, isPending, navigate]);

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Header />
			<GroupForm />
			<GroupList />
		</div>
	);
}
