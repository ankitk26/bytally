import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const handleLogin = async () => {
		await authClient.signIn.social({
			provider: "google",
		});
	};

	return (
		<main className="relative flex min-h-screen overflow-hidden">
			<div className="pointer-events-none absolute inset-0 lg:hidden">
				<div className="bg-chart-2/20 absolute -top-32 -left-32 h-64 w-64 rounded-full blur-3xl" />
				<div className="bg-chart-4/20 absolute top-1/3 -right-20 h-48 w-48 rounded-full blur-3xl" />
				<div className="bg-chart-1/15 absolute bottom-20 -left-10 h-40 w-40 rounded-full blur-3xl" />
			</div>

			<div className="bg-foreground text-background hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
				<div>
					<span className="font-serif text-2xl italic">bytally</span>
				</div>
				<div className="max-w-md">
					<h1 className="mb-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
						Shared expenses,
						<br />
						<em>made simple.</em>
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
						<span className="text-foreground font-serif text-xl italic">
							bytally
						</span>
						<p className="text-muted-foreground mt-1 text-sm">
							Shared expenses, <em className="font-serif">made simple.</em>
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
						className="hover:bg-primary/90 w-full gap-2.5 transition-colors duration-200"
						size="lg"
					>
						<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
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
