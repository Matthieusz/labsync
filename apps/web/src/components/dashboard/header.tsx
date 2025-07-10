import UserMenu from "./user-menu";

export default function Header() {
	return (
		<div className="flex items-center justify-between border-border border-b px-4 py-2 text-foreground">
			<div className="font-bold text-2xl">Dashboard</div>
			<UserMenu />
		</div>
	);
}
