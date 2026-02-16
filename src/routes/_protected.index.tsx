import { createFileRoute } from "@tanstack/react-router";
import GroupsForm from "~/components/groups-form";
import GroupsList from "~/components/groups-list";
import { Button } from "~/components/ui/button";
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
		<div className="bg-background min-h-screen">
			{/* Header */}
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

			{/* Main */}
			<main className="mx-auto max-w-6xl px-6 py-8">
				{/* Page Title */}
				<div className="border-border mb-6 flex items-end justify-between border-b pb-4">
					<div>
						<h1 className="text-foreground font-serif text-3xl">Groups</h1>
						<p className="text-muted-foreground mt-0.5 text-xs">
							Manage your communities
						</p>
					</div>
					<span className="text-muted-foreground text-xs tabular-nums">
						{new Date().toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
				</div>

				{/* Content */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
					<div className="lg:col-span-3">
						<GroupsList />
					</div>
					<div className="lg:col-span-2">
						<GroupsForm />
					</div>
				</div>
			</main>
		</div>
	);
}
