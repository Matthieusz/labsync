import { redirect } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "../mode-toggle";

export default function UserMenu() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div>Loading...</div>;
	}

	const handleSignOut = async () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					redirect({
						to: "/login",
					});
					toast.success("Sign out successful");
				},
			},
		});
	};

	return (
		<div className="flex items-center gap-2">
			<ModeToggle />
			<div className="flex items-center gap-2 rounded-lg p-2 text-foreground hover:bg-foreground/10">
				<div>
					{session?.user?.image ? (
						<img src={session.user.image} alt="User Avatar" />
					) : (
						<User className="size-6 text-foreground" />
					)}
				</div>
				<div className="font-semibold">{session?.user?.name}</div>
			</div>
			<button
				className="flex items-center gap-2 rounded-lg p-2 text-foreground hover:bg-destructive/50"
				type="button"
				onClick={handleSignOut}
			>
				<LogOut className="size-6 text-destructive" />
			</button>
		</div>
	);
}
