import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Header from "~/components/header";
import { authUserQuery } from "~/queries/auth-user-query";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ context }) => {
		const auth = await context.queryClient.fetchQuery(authUserQuery);
		if (!auth) {
			throw redirect({ to: "/login" });
		}
		return {
			auth: {
				authId: auth._id,
				email: auth.email,
			},
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
}
