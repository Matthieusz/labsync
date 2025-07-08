import { BookOpen } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { Button } from "../ui/button";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-border border-b bg-background/80 backdrop-blur-sm">
			<div className="container mx-auto flex items-center justify-between px-4 py-4">
				<div className="flex items-center space-x-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<BookOpen className="h-5 w-5 text-primary-foreground" />
					</div>
					<span className="font-bold font-sans text-foreground text-xl">
						LabSync
					</span>
				</div>
				<nav className="hidden items-center space-x-6 md:flex">
					<a
						href="#features"
						className="text-muted-foreground transition-colors hover:text-foreground"
					>
						Features
					</a>
					<a
						href="#about"
						className="text-muted-foreground transition-colors hover:text-foreground"
					>
						About
					</a>
					<a
						href="#contact"
						className="text-muted-foreground transition-colors hover:text-foreground"
					>
						Contact
					</a>
				</nav>
				<div className="flex items-center space-x-3">
					<Button variant="secondary">Sign In</Button>
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
