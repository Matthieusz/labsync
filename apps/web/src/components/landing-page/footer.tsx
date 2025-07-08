import { BookOpen } from "lucide-react";

export default function Footer() {
	return (
		<footer id="contact" className="border-border border-t bg-card px-4 py-12">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					<div>
						<div className="mb-4 flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<BookOpen className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="font-bold font-sans text-card-foreground text-xl">
								LabSync
							</span>
						</div>
						<p className="text-muted-foreground">
							Streamlining laboratory work for technical students worldwide.
						</p>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-card-foreground">Product</h4>
						<div className="space-y-2">
							<a
								href="#features"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								Features
							</a>
							<a
								href="#pricing"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								Pricing
							</a>
							<a
								href="#security"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								Security
							</a>
						</div>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-card-foreground">Support</h4>
						<div className="space-y-2">
							<a
								href="#documentation"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								Documentation
							</a>
							<a
								href="#help"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								Help Center
							</a>
							<a
								href="#contact"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								Contact
							</a>
						</div>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-card-foreground">Company</h4>
						<div className="space-y-2">
							<a
								href="#about"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								About
							</a>
							<a
								href="#blog"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								Blog
							</a>
							<a
								href="#privacy"
								className="block text-muted-foreground transition-colors hover:text-card-foreground"
							>
								Privacy
							</a>
						</div>
					</div>
				</div>

				<div className="mt-8 border-border border-t pt-8 text-center">
					<p className="text-muted-foreground">
						© 2025 LabSync. All rights reserved. Built for university laboratory
						groups.
					</p>
				</div>
			</div>
		</footer>
	);
}
