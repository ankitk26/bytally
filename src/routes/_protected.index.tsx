import { createFileRoute } from "@tanstack/react-router";
import GroupsList from "~/components/groups-list";
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
			<div className="flex items-center gap-4">
				<p>Welcome {auth.email}</p>
				<button type="button" onClick={handleSignOut}>
					Log out
				</button>
			</div>

			<GroupsList />
		</div>
	);
}
