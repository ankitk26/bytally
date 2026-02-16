import { createFileRoute } from "@tanstack/react-router";
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
		<main className="flex min-h-screen">
			{/* Left - Branding */}
			<div className="bg-foreground text-background hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
				<div>
					<span className="font-serif text-2xl italic">bitally</span>
				</div>
				<div className="max-w-md">
					<h1 className="mb-4 font-serif text-5xl leading-tight">
						Where groups
						<br />
						<em>come together.</em>
					</h1>
					<p className="text-background/60 text-sm">
						The modern way to organize, manage, and grow your communities.
					</p>
				</div>
				<p className="text-background/40 text-xs">
					Trusted by 2,000+ organizations worldwide
				</p>
			</div>

			{/* Right - Login */}
			<div className="flex flex-1 items-center justify-center p-6">
				<div className="w-full max-w-xs">
					<div className="mb-8 lg:hidden">
						<span className="text-foreground font-serif text-xl italic">
							bitally
						</span>
					</div>

					<div className="mb-6">
						<h2 className="text-foreground mb-1 font-serif text-2xl">
							Sign in
						</h2>
						<p className="text-muted-foreground text-sm">
							Continue to your dashboard
						</p>
					</div>

					<button
						type="button"
						onClick={handleLogin}
						className="bg-foreground text-background flex w-full items-center justify-center gap-2.5 rounded px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 active:opacity-70"
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
					</button>

					<p className="text-muted-foreground mt-4 text-center text-xs">
						By continuing, you agree to our{" "}
						<span className="cursor-pointer underline">Terms</span> and{" "}
						<span className="cursor-pointer underline">Privacy Policy</span>
					</p>
				</div>
			</div>
		</main>
	);
}
