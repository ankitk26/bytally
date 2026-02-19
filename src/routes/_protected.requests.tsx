import { InboxIcon, SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import ReceivedRequests from "~/components/received-requests";
import SentRequests from "~/components/sent-requests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const Route = createFileRoute("/_protected/requests")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="bg-background min-h-screen">
			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<div className="mb-6 flex items-end justify-between pb-4">
					<div>
						<h1 className="text-foreground font-serif text-2xl sm:text-3xl">
							Requests
						</h1>
					</div>
				</div>

				<div className="max-w-3xl">
					<Tabs
						defaultValue="received"
						orientation="horizontal"
						className="flex w-full flex-col"
					>
						<TabsList
							variant="line"
							className="border-border mb-6 flex flex-row gap-4 border-b bg-transparent p-0"
						>
							<TabsTrigger value="received">
								<HugeiconsIcon
									icon={InboxIcon}
									className="h-3.5 w-3.5"
									strokeWidth={2}
								/>
								Received
							</TabsTrigger>
							<TabsTrigger value="sent">
								<HugeiconsIcon
									icon={SentIcon}
									className="h-3.5 w-3.5"
									strokeWidth={2}
								/>
								Sent
							</TabsTrigger>
						</TabsList>
						<TabsContent value="received">
							<ReceivedRequests />
						</TabsContent>
						<TabsContent value="sent">
							<SentRequests />
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	);
}
