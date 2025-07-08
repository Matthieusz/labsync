import { Loader2 } from "lucide-react";

export default function Loader() {
	return (
		<div className="flex h-full flex-col items-center justify-center pt-8">
			<Loader2 className="size-12 animate-spin text-foreground" />
			<span className="mt-2 text-foreground">Loading...</span>
		</div>
	);
}
