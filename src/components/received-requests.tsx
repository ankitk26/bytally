import { convexQuery } from "@convex-dev/react-query";
import { InboxIcon } from "@hugeicons/core-free-icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { ReceivedRequestCard } from "./received-request-card";
import { RequestEmptyState } from "./request-empty-state";
import { RequestSkeleton } from "./request-skeleton";

export function ReceivedRequests() {
	const { data: requests, isPending } = useQuery(
		convexQuery(api.requests.getReceivedRequests),
	);

	if (isPending) {
		return <RequestSkeleton count={3} />;
	}

	if (requests?.length === 0) {
		return (
			<RequestEmptyState
				icon={InboxIcon}
				title="No requests"
				description="No incoming requests yet"
			/>
		);
	}

	return (
		<div className="divide-border border-border divide-y border-y">
			{requests?.map((request, index) => (
				<ReceivedRequestCard
					key={request._id}
					request={request}
					index={index}
				/>
			))}
		</div>
	);
}
