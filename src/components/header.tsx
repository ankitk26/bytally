import { useRouteContext } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";
import { Button } from "./ui/button";

export default function Header() {
	const { auth } = useRouteContext({ from: "/_protected" });

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					location.reload();
				},
			},
		});
	};

	return (
		<header className="border-border border-b">
			<div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
				<span className="text-foreground font-serif text-base italic">
					bitally
				</span>
				<div className="flex items-center gap-3">
					<span className="text-muted-foreground hidden text-xs sm:block">
						{auth.email}
					</span>
					<Button variant="ghost" size="xs" onClick={handleSignOut}>
						Sign out
					</Button>
				</div>
			</div>
		</header>
	);
}
