import { Outlet } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthUser } from "~/server-fns/get-auth";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async () => {
		const auth = await getAuthUser();
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
	return <Outlet />;
}
