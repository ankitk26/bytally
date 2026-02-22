import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
/// <reference types="vite/client" />
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useRouteContext,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";
import { TooltipProvider } from "~/components/ui/tooltip";
import { authClient } from "~/lib/auth-client";
import { getToken } from "~/lib/auth-server";
import { getAppTheme } from "~/lib/theme";
import appCss from "../styles.css?url";

const getAuth = createServerFn({ method: "GET" }).handler(async () => {
	return await getToken();
});

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	convexQueryClient: ConvexQueryClient;
}>()({
	beforeLoad: async (ctx) => {
		const token = await getAuth();

		// all queries, mutations and actions through TanStack Query will be
		// authenticated during SSR if we have a valid token
		if (token) {
			// During SSR only (the only time serverHttpClient exists),
			// set the auth token to make HTTP queries with.
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
		}

		const theme = await getAppTheme();

		return {
			isAuthenticated: !!token,
			token,
			theme,
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "bytally",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
});

function RootComponent() {
	const context = useRouteContext({ from: Route.id });
	return (
		<ConvexBetterAuthProvider
			client={context.convexQueryClient.convexClient}
			authClient={authClient}
			initialToken={context.token}
		>
			<RootDocument>
				<Outlet />
			</RootDocument>
		</ConvexBetterAuthProvider>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	const { theme } = Route.useRouteContext();

	return (
		<html lang="en" className={theme === "dark" ? theme : ""}>
			<head>
				<HeadContent />
			</head>
			<body className="bg-background text-foreground min-h-screen antialiased">
				<TooltipProvider>{children}</TooltipProvider>
				<Scripts />
			</body>
		</html>
	);
}
