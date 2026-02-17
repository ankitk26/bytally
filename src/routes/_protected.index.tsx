import { createFileRoute } from "@tanstack/react-router";
import GroupsForm from "~/components/groups-form";
import GroupsList from "~/components/groups-list";

export const Route = createFileRoute("/_protected/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="bg-background min-h-screen">
			{/* Main */}
			<main className="mx-auto max-w-6xl px-6 py-8">
				{/* Page Title */}
				<div className="mb-6 flex items-end justify-between pb-4">
					<div>
						<h1 className="text-foreground font-serif text-3xl">Groups</h1>
					</div>
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
