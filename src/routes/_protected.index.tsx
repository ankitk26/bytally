import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";

export const Route = createFileRoute("/_protected/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { auth } = Route.useRouteContext();

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
		<div>
			This is protected route
			<p>Welcome {auth.email}</p>
			<button type="button" onClick={handleSignOut}>
				Log out
			</button>
		</div>
	);
}
