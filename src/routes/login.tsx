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
		<button type="button" onClick={handleLogin}>
			Login with Google
		</button>
	);
}
