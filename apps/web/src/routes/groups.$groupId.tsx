import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/utils/trpc";

const GroupPageSearchSchema = z.object({
	tab: z
		.enum(["overview", "members", "settings"])
		.optional()
		.default("overview"),
});

export const Route = createFileRoute("/groups/$groupId")({
	component: GroupPage,
	validateSearch: GroupPageSearchSchema,
});

function GroupPage() {
	const { groupId } = Route.useParams();
	const { tab } = Route.useSearch();
	const trpc = useTRPC();
	const navigate = useNavigate({ from: Route.fullPath });
	const { data: session, isPending: sessionPending } = authClient.useSession();

	const group = useQuery(trpc.group.getById.queryOptions({ id: groupId }));
	console.log("Group data:", group.data);

	useEffect(() => {
		if (!session && !sessionPending) {
			navigate({
				to: "/login",
			});
		}
	}, [session, sessionPending, navigate]);

	if (sessionPending || !session || group.isLoading) {
		return <Loader />;
	}

	if (group.error) {
		return (
			<div className="container mx-auto bg-background p-4">
				<div className="text-center">
					<h1 className="font-bold text-2xl text-red-600">Group Not Found</h1>
					<p className="mt-2 text-muted-foreground">
						The group you're looking for doesn't exist or you don't have access
						to it.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<div className="mx-auto max-w-4xl">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-3xl">{group.data?.name}</CardTitle>
								<p className="mt-2 text-muted-foreground">
									{group.data?.description}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant={group.data?.isPublic ? "default" : "secondary"}>
									{group.data?.isPublic ? "Public" : "Private"}
								</Badge>
								<Badge variant="outline">
									{group.data?.memberCount} members
								</Badge>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="mb-6 flex gap-2">
							<Button
								variant={tab === "overview" ? "default" : "outline"}
								onClick={() =>
									navigate({
										search: { tab: "overview" },
									})
								}
							>
								Overview
							</Button>
							<Button
								variant={tab === "members" ? "default" : "outline"}
								onClick={() =>
									navigate({
										search: { tab: "members" },
									})
								}
							>
								Members
							</Button>
							<Button
								variant={tab === "settings" ? "default" : "outline"}
								onClick={() =>
									navigate({
										search: { tab: "settings" },
									})
								}
							>
								Settings
							</Button>
						</div>

						{tab === "overview" && (
							<div>
								<h3 className="mb-4 font-semibold text-lg">Group Overview</h3>
								<div className="space-y-4">
									<div>
										<p className="text-muted-foreground text-sm">Created</p>
										<p>
											{group.data?.createdAt
												? new Date(group.data.createdAt).toLocaleDateString()
												: "Unknown"}
										</p>
									</div>
									<div>
										<p className="text-muted-foreground text-sm">
											Last Updated
										</p>
										<p>
											{group.data?.updatedAt
												? new Date(group.data.updatedAt).toLocaleDateString()
												: "Unknown"}
										</p>
									</div>
								</div>
							</div>
						)}

						{tab === "members" && (
							<div>
								<h3 className="mb-4 font-semibold text-lg">Members</h3>
								{group.data?.members.length ? (
									<ul className="space-y-2">
										{group.data.members.map((member) => (
											<li
												key={member.id}
												className="flex items-center justify-between"
											>
												<span>{member.user?.name}</span>
												<Button variant="outline" size="sm">
													Remove
												</Button>
											</li>
										))}
									</ul>
								) : (
									<p className="text-muted-foreground">No members found.</p>
								)}
							</div>
						)}

						{tab === "settings" && (
							<div>
								<h3 className="mb-4 font-semibold text-lg">Group Settings</h3>
								<p className="text-muted-foreground">
									Not yet implemented. Stay tuned!
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
