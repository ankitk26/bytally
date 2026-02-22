import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import GroupsForm from "~/components/groups-form";
import GroupsList from "~/components/groups-list";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

export const Route = createFileRoute("/_protected/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="bg-background min-h-screen">
			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<div className="mb-6 flex items-end justify-between pb-4">
					<div>
						<h1 className="text-foreground font-serif text-2xl sm:text-3xl">
							Groups
						</h1>
					</div>
					<Dialog>
						<DialogTrigger
							render={
								<Button size="sm" className="lg:hidden">
									<HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
									Add group
								</Button>
							}
						/>
						<DialogContent className="max-w-md">
							<GroupsForm showBorder={false} />
						</DialogContent>
					</Dialog>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
					<div className="lg:col-span-3">
						<GroupsList />
					</div>
					<div className="hidden lg:col-span-2 lg:block">
						<GroupsForm />
					</div>
				</div>
			</main>
		</div>
	);
}
