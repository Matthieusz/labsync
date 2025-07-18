import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTRPC } from "@/utils/trpc";
import Loader from "../loader";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

export default function GroupList() {
	const trpc = useTRPC();
	const groups = useQuery(trpc.group.getAll.queryOptions());

	const deleteMutation = useMutation(
		trpc.group.delete.mutationOptions({
			onSuccess: () => {
				groups.refetch();
			},
		}),
	);

	const joinMutation = useMutation(
		trpc.group.join.mutationOptions({
			onError: (error) => {
				if (error.data?.code === "CONFLICT") {
					toast.error("You are already a member of this group.");
				}
			},
			onSuccess: () => {
				groups.refetch();
			},
		}),
	);

	const handleDeleteGroup = (groupId: string) => {
		if (confirm("Are you sure you want to delete this group?")) {
			deleteMutation.mutate({ id: groupId });
		}
	};

	const handleJoinGroup = (groupId: string) => {
		if (confirm("Are you sure you want to join this group?")) {
			joinMutation.mutate({ groupId: groupId });
		}
	};

	if (groups.isLoading) {
		return <Loader />;
	}

	return (
		<div className="p-4">
			<h2 className="mb-4 font-bold text-xl">Groups</h2>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{groups.data?.map((group) => (
					<Card key={group.id} className="overflow-hidden">
						<CardHeader>
							<CardTitle>{group.name}</CardTitle>
							{group.description && (
								<CardDescription>{group.description}</CardDescription>
							)}
							{group.memberCount && (
								<p className="text-muted-foreground text-sm">
									Members: {group.memberCount}
								</p>
							)}
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">
								{group.createdAt && (
									<span>
										Created: {new Date(group.createdAt).toLocaleDateString()}
									</span>
								)}
							</p>
							<div className="mt-4 flex justify-between">
								<Button
									variant="destructive"
									type="button"
									className="text-white transition-colors hover:bg-red-600"
									onClick={() => handleDeleteGroup(group.id)}
								>
									Delete
								</Button>
								<Button asChild>
									<Link to="/groups/$groupId" params={{ groupId: group.id }}>
										Visit
									</Link>
								</Button>
								<Button
									variant="default"
									disabled={joinMutation.isPending}
									onClick={() => handleJoinGroup(group.id)}
								>
									Join
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
