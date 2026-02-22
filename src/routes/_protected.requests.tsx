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
			<main className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
				<h1 className="text-foreground mb-4 font-serif text-xl lg:mb-6 lg:pb-4 lg:text-2xl">
					Requests
				</h1>

				<Tabs
					defaultValue="received"
					orientation="horizontal"
					className="flex w-full flex-col"
				>
					<TabsList
						variant="line"
						className="border-border mb-4 grid w-full grid-cols-2 border-b bg-transparent p-0 lg:mb-6 lg:flex lg:w-fit lg:gap-4"
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
			</main>
		</div>
	);
}
