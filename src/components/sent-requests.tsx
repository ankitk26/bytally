import { convexQuery } from "@convex-dev/react-query";
import { SentIcon } from "@hugeicons/core-free-icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { RequestEmptyState } from "./request-empty-state";
import { RequestSkeleton } from "./request-skeleton";
import { SentRequestCard } from "./sent-request-card";

export function SentRequests() {
	const { data: requests, isPending } = useQuery(
		convexQuery(api.requests.getSentRequests),
	);

	if (isPending) {
		return <RequestSkeleton count={3} />;
	}

	if (requests?.length === 0) {
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
			{requests?.map((request, index) => (
				<SentRequestCard key={request._id} request={request} index={index} />
			))}
		</div>
	);
}
