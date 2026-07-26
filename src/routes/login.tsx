import { GoogleLogo, SpinnerIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		setIsLoading(true);
		await authClient.signIn.social({
			provider: "google",
		});
	};

	return (
		<main className="relative flex min-h-screen overflow-hidden">
			<div className="pointer-events-none absolute inset-0 lg:hidden">
				<div className="bg-chart-2/20 absolute -top-32 -left-32 h-64 w-64 blur-3xl" />
				<div className="bg-chart-4/20 absolute top-1/3 -right-20 h-48 w-48 blur-3xl" />
				<div className="bg-chart-1/15 absolute bottom-20 -left-10 h-40 w-40 blur-3xl" />
			</div>

			<div className="bg-foreground text-background hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
				<div>
					<span className="font-serif text-2xl">bytally</span>
				</div>
				<div className="max-w-md">
					<h1 className="mb-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
						Shared expenses,
						<br />
						made simple.
					</h1>
					<p className="text-background/60 text-sm">
						Track shared costs, split bills fairly, and settle up with
						friends—effortlessly.
					</p>
				</div>
				<p className="text-background/40 text-xs">
					Splitting bills made simple
				</p>
			</div>

			<div className="relative z-10 flex flex-1 items-center justify-center p-6">
				<div className="w-full max-w-xs">
					<div className="mb-8 lg:hidden">
						<span className="text-foreground font-serif text-xl">bytally</span>
						<p className="text-muted-foreground mt-1 text-sm">
							Shared expenses, made simple.
						</p>
					</div>

					<div className="mb-6">
						<h2 className="text-foreground mb-1 font-serif text-2xl">
							Welcome back
						</h2>
						<p className="text-muted-foreground text-sm">
							Sign in to manage your group expenses
						</p>
					</div>

					<Button
						onClick={handleLogin}
						disabled={isLoading}
						className="hover:bg-primary/90 w-full gap-2.5 transition-colors duration-200"
						size="lg"
					>
						{isLoading ? (
							<SpinnerIcon className="h-4 w-4 animate-spin" />
						) : (
							<GoogleLogo className="h-4 w-4" weight="bold" />
						)}
						Continue with Google
					</Button>

					<p className="text-muted-foreground/50 mt-8 text-center text-xs lg:hidden">
						Splitting bills made simple
					</p>
				</div>
			</div>
		</main>
	);
}
