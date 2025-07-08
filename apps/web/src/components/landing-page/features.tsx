import { Bell, Calendar, Clock, FileText, Shield, Users } from "lucide-react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Features() {
	return (
		<div>
			<div className="border-border/50 border-t" />
			<section id="features" className="bg-background px-4 py-20">
				<div className="container mx-auto max-w-6xl">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold font-sans text-4xl text-foreground">
							Everything you need for a success
						</h2>
						<p className="mx-auto max-w-2xl text-muted-foreground text-xl">
							Designed specifically for technical students working in laboratory
							environments
						</p>
					</div>

					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						<Card className="border-border shadow-lg transition-shadow hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Calendar className="h-6 w-6 text-primary" />
								</div>
								<CardTitle>Event Management</CardTitle>
								<CardDescription>
									Keep track of exams, quizzes, lab sessions, and important
									deadlines in one centralized calendar
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-border shadow-lg transition-shadow hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<CardTitle>Smart Subgroups</CardTitle>
								<CardDescription>
									Create focused teams for specific subjects or lab work with
									dedicated communication channels
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-border shadow-lg transition-shadow hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<FileText className="h-6 w-6 text-primary" />
								</div>
								<CardTitle>File Sharing</CardTitle>
								<CardDescription>
									Upload and share lab instructions, reports, results, and other
									materials with your team
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-border shadow-lg transition-shadow hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
									<Bell className="h-6 w-6 text-accent-foreground" />
								</div>
								<CardTitle>Smart Notifications</CardTitle>
								<CardDescription>
									Never miss important deadlines with intelligent reminders and
									notifications
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-border shadow-lg transition-shadow hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
									<Shield className="h-6 w-6 text-accent-foreground" />
								</div>
								<CardTitle>Secure & Private</CardTitle>
								<CardDescription>
									Your data is protected with enterprise-grade security and
									encrypted storage
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-border shadow-lg transition-shadow hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
									<Clock className="h-6 w-6 text-accent-foreground" />
								</div>
								<CardTitle>Deadline Tracking</CardTitle>
								<CardDescription>
									Advanced deadline management with priority levels and
									automatic reminders for critical tasks
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>
		</div>
	);
}
