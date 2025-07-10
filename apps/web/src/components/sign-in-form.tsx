import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod/v4";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignInForm() {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending, data: session } = authClient.useSession();

	useEffect(() => {
		if (session?.user) {
			navigate({
				to: "/dashboard",
			});
		}
	}, [session, navigate]);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
			<div className="container mx-auto max-w-md">
				<div className="rounded-xl border border-border bg-card p-8 shadow-xl">
					<h1 className="mb-6 text-center font-bold font-sans text-3xl text-card-foreground">
						Welcome Back
					</h1>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
						className="space-y-6"
					>
						<div>
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor={field.name}
											className="text-card-foreground"
										>
											Email
										</Label>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="bg-background"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500 text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="password">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor={field.name}
											className="text-card-foreground"
										>
											Password
										</Label>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="bg-background"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500 text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									size="lg"
									className="w-full py-3 text-lg"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? "Submitting..." : "Sign In"}
								</Button>
							)}
						</form.Subscribe>
					</form>

					<div className="mt-6 text-center">
						<Button
							variant="link"
							onClick={() =>
								navigate({
									to: "/sign-up",
								})
							}
							className="text-primary hover:text-primary/80"
						>
							Need an account? Sign Up
						</Button>
					</div>
				</div>

				<div className="mt-4 text-center">
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/" })}
						className="text-muted-foreground hover:text-foreground"
					>
						← Back
					</Button>
				</div>
			</div>
		</div>
	);
}
