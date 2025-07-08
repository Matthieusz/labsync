import { createFileRoute } from "@tanstack/react-router";
import CTASection from "@/components/landing-page/cta-section";
import Features from "@/components/landing-page/features";
import Footer from "@/components/landing-page/footer";
import Header from "@/components/landing-page/header";
import Hero from "@/components/landing-page/hero";
import TargetAudience from "@/components/landing-page/target-audience";
import TechStack from "@/components/landing-page/tech-stack";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<Hero />
			<Features />
			<TargetAudience />
			<TechStack />
			<CTASection />
			<Footer />
		</div>
	);
}
