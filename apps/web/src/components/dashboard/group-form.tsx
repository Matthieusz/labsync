import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTRPC } from "@/utils/trpc";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

export default function GroupForm() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const groupQueryKey = trpc.group.getAll.queryKey();

	const [newGroupName, setNewGroupName] = useState("");
	const [newGroupDescription, setNewGroupDescription] = useState("");

	const createMutation = useMutation(
		trpc.group.create.mutationOptions({
			onSuccess: () => {
				setNewGroupName("");
				setNewGroupDescription("");
				queryClient.invalidateQueries({ queryKey: groupQueryKey });
			},
		}),
	);
	const handleAddGroup = (e: React.FormEvent) => {
		e.preventDefault();
		if (newGroupName.trim()) {
			createMutation.mutate({
				name: newGroupName,
				description: newGroupDescription,
			});
		}
	};
	return (
		<div className="p-4">
			<Card>
				<CardHeader>
					<CardTitle>Group Form</CardTitle>
					<CardDescription>Create or update a group</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleAddGroup}
						className="mb-6 flex items-center space-x-2"
					>
						<Input
							value={newGroupName}
							onChange={(e) => setNewGroupName(e.target.value)}
							placeholder="Add a new group..."
							disabled={createMutation.isPending}
						/>
						<Input
							value={newGroupDescription}
							onChange={(e) => setNewGroupDescription(e.target.value)}
							placeholder="Group description"
							disabled={createMutation.isPending}
						/>
						<Button
							type="submit"
							disabled={createMutation.isPending || !newGroupName.trim()}
						>
							{createMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Add"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
