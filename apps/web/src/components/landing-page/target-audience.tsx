import { CheckCircle, Clock, FileText, Share2 } from "lucide-react";

export default function TargetAudience() {
	return (
		<div>
			<div className="border-border border-t" />
			<section id="about" className="bg-background px-4 py-20">
				<div className="container mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold font-sans text-4xl text-foreground">
							Built for Technical Students
						</h2>
						<p className="text-muted-foreground text-xl">
							Specifically designed for university laboratory groups and
							team-based learning
						</p>
					</div>

					<div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
						<div>
							<h3 className="mb-6 font-bold font-sans text-2xl text-foreground">
								Perfect for:
							</h3>
							<div className="space-y-4">
								<div className="flex items-center space-x-3">
									<CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
									<span className="text-foreground">
										Engineering and technical students
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
									<span className="text-foreground">Laboratory work teams</span>
								</div>
								<div className="flex items-center space-x-3">
									<CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
									<span className="text-foreground">
										Research project groups
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
									<span className="text-foreground">
										Study groups and academic teams
									</span>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-border bg-card p-8 shadow-lg">
							<h4 className="mb-4 font-semibold text-card-foreground text-lg">
								Key Benefits
							</h4>
							<div className="space-y-3">
								<div className="flex items-start space-x-3">
									<Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
									<div>
										<p className="font-medium text-card-foreground">
											Better Time Management
										</p>
										<p className="text-muted-foreground text-sm">
											Stay on top of deadlines and schedules
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<Share2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
									<div>
										<p className="font-medium text-card-foreground">
											Enhanced Collaboration
										</p>
										<p className="text-muted-foreground text-sm">
											Work together more effectively
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
									<div>
										<p className="font-medium text-card-foreground">
											Organized Resources
										</p>
										<p className="text-muted-foreground text-sm">
											Keep all materials in one place
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
