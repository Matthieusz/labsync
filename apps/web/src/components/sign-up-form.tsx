import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod/v4";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
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
						Create Account
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
							<form.Field name="name">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor={field.name}
											className="text-card-foreground"
										>
											Name
										</Label>
										<Input
											id={field.name}
											name={field.name}
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
									{state.isSubmitting ? "Submitting..." : "Sign Up"}
								</Button>
							)}
						</form.Subscribe>
					</form>

					<div className="mt-6 text-center">
						<Button
							variant="link"
							onClick={onSwitchToSignIn}
							className="text-primary hover:text-primary/80"
						>
							Already have an account? Sign In
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
