import { ArrowRight, Calendar, FileText, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function Hero() {
	return (
		<section className="px-4 py-20">
			<div className="container mx-auto max-w-4xl text-center">
				<Badge variant="secondary" className="mb-4">
					For University Students
				</Badge>
				<h1 className="mb-6 font-bold font-sans text-5xl text-foreground leading-tight md:text-6xl">
					Streamline Your
					<span className="text-primary"> Lab Work</span>
				</h1>
				<p className="mb-8 text-muted-foreground text-xl leading-relaxed">
					Centralize exam schedules, create study subgroups, share files, and
					stay organized. The all-in-one platform designed specifically for
					technical students and laboratory teams.
				</p>
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Button size="lg" className="px-8 py-3 text-lg">
						Start Now
						<ArrowRight className="ml-2 h-5 w-5" />
					</Button>
				</div>
				<div className="relative mt-12">
					<div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8 shadow-xl">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<div className="text-center">
								<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Calendar className="h-6 w-6 text-primary" />
								</div>
								<h3 className="font-semibold text-card-foreground">
									Smart Calendar
								</h3>
								<p className="text-muted-foreground text-sm">
									Track exams and deadlines
								</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<h3 className="font-semibold text-card-foreground">
									Team Collaboration
								</h3>
								<p className="text-muted-foreground text-sm">
									Create focused subgroups
								</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<FileText className="h-6 w-6 text-primary" />
								</div>
								<h3 className="font-semibold text-card-foreground">
									File Management
								</h3>
								<p className="text-muted-foreground text-sm">
									Share resources easily
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
