import { convexQuery } from "@convex-dev/react-query";
import { SentIcon } from "@hugeicons/core-free-icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import RequestEmptyState from "./request-empty-state";
import RequestSkeleton from "./request-skeleton";
import SendRequestForm from "./send-request-form";
import SentRequestCard from "./sent-request-card";

export default function SentRequests() {
	const { data: requests, isPending } = useQuery(
		convexQuery(api.requests.getSentRequests),
	);

	if (isPending) {
		return (
			<div className="space-y-4">
				<SendRequestForm />
				<RequestSkeleton count={3} />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<SendRequestForm />
			{requests?.length === 0 ? (
				<RequestEmptyState
					icon={SentIcon}
					title="No requests"
					description="You haven't sent any requests"
				/>
			) : (
				<div className="divide-border border-border divide-y border-y">
					{requests?.map((request, index) => (
						<SentRequestCard
							key={request._id}
							request={request}
							index={index}
						/>
					))}
				</div>
			)}
		</div>
	);
}
