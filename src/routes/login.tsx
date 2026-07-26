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
				<div className="absolute -top-32 -left-32 h-64 w-64 bg-chart-2/20 blur-3xl" />
				<div className="absolute top-1/3 -right-20 h-48 w-48 bg-chart-4/20 blur-3xl" />
				<div className="absolute bottom-20 -left-10 h-40 w-40 bg-chart-1/15 blur-3xl" />
			</div>

			<div className="hidden flex-col justify-between bg-foreground p-12 text-background lg:flex lg:w-1/2">
				<div>
					<span className="font-serif text-2xl">bytally</span>
				</div>
				<div className="max-w-md">
					<h1 className="mb-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
						Shared expenses,
						<br />
						made simple.
					</h1>
					<p className="text-sm text-background/60">
						Track shared costs, split bills fairly, and settle up with
						friends—effortlessly.
					</p>
				</div>
				<p className="text-xs text-background/40">
					Splitting bills made simple
				</p>
			</div>

			<div className="relative z-10 flex flex-1 items-center justify-center p-6">
				<div className="w-full max-w-xs">
					<div className="mb-8 lg:hidden">
						<span className="font-serif text-xl text-foreground">bytally</span>
						<p className="mt-1 text-sm text-muted-foreground">
							Shared expenses, made simple.
						</p>
					</div>

					<div className="mb-6">
						<h2 className="mb-1 font-serif text-2xl text-foreground">
							Welcome back
						</h2>
						<p className="text-sm text-muted-foreground">
							Sign in to manage your group expenses
						</p>
					</div>

					<Button
						onClick={handleLogin}
						disabled={isLoading}
						className="w-full gap-2.5 transition-colors duration-200 hover:bg-primary/90"
						size="lg"
					>
						{isLoading ? (
							<SpinnerIcon className="h-4 w-4 animate-spin" />
						) : (
							<GoogleLogo className="h-4 w-4" weight="bold" />
						)}
						Continue with Google
					</Button>

					<p className="mt-8 text-center text-xs text-muted-foreground/50 lg:hidden">
						Splitting bills made simple
					</p>
				</div>
			</div>
		</main>
	);
}
