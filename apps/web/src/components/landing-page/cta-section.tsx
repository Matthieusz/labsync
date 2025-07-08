import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export default function CTASection() {
	return (
		<section className="bg-primary px-4 py-20">
			<div className="container mx-auto max-w-4xl text-center">
				<h2 className="mb-4 font-bold font-sans text-4xl text-primary-foreground">
					Ready to Transform Your Lab Work?
				</h2>
				<p className="mb-8 text-primary-foreground/80 text-xl">
					Join thousands of students already using LabSync to stay organized and
					collaborate effectively
				</p>
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Link to="/login">
						<Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
							Start Now
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
