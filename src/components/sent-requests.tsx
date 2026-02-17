import { SentIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import type { Request } from "./request-types";
import { RequestEmptyState } from "./request-empty-state";
import { RequestSkeleton } from "./request-skeleton";
import { SentRequestCard } from "./sent-request-card";

const mockSentRequests: Request[] = [
	{
		id: "4",
		email: "jane@example.com",
		status: "accepted",
		createdAt: new Date("2026-02-13"),
	},
	{
		id: "5",
		email: "alex@example.com",
		status: "rejected",
		createdAt: new Date("2026-02-12"),
	},
	{
		id: "6",
		email: "chris@example.com",
		status: "pending",
		createdAt: new Date("2026-02-16"),
	},
];

export function SentRequests() {
	const [isPending] = useState(false);
	const [sentRequests] = useState<Request[]>(mockSentRequests);

	if (isPending) {
		return <RequestSkeleton count={3} />;
	}

	if (sentRequests.length === 0) {
		return (
			<RequestEmptyState
				icon={SentIcon}
				title="No requests"
				description="You haven't sent any requests"
			/>
		);
	}

	return (
		<div className="divide-border border-border divide-y border-y">
			{sentRequests.map((request, index) => (
				<SentRequestCard key={request.id} request={request} index={index} />
			))}
		</div>
	);
}
