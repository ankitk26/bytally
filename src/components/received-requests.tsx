import { InboxIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import type { Request } from "./request-types";
import { ReceivedRequestCard } from "./received-request-card";
import { RequestEmptyState } from "./request-empty-state";
import { RequestSkeleton } from "./request-skeleton";

const mockReceivedRequests: Request[] = [
	{
		id: "1",
		email: "john@example.com",
		status: "pending",
		createdAt: new Date("2026-02-15"),
	},
	{
		id: "2",
		email: "sarah@example.com",
		status: "pending",
		createdAt: new Date("2026-02-14"),
	},
	{
		id: "3",
		email: "mike@example.com",
		status: "accepted",
		createdAt: new Date("2026-02-10"),
	},
];

export function ReceivedRequests() {
	const [isPending] = useState(false);
	const [receivedRequests, setReceivedRequests] =
		useState<Request[]>(mockReceivedRequests);

	const handleAccept = (id: string) => {
		setReceivedRequests((prev) =>
			prev.map((req) => (req.id === id ? { ...req, status: "accepted" } : req)),
		);
	};

	const handleReject = (id: string) => {
		setReceivedRequests((prev) =>
			prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req)),
		);
	};

	const handleUndo = (id: string) => {
		setReceivedRequests((prev) =>
			prev.map((req) => (req.id === id ? { ...req, status: "pending" } : req)),
		);
	};

	if (isPending) {
		return <RequestSkeleton count={3} />;
	}

	if (receivedRequests.length === 0) {
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
			{receivedRequests.map((request, index) => (
				<ReceivedRequestCard
					key={request.id}
					request={request}
					index={index}
					onAccept={handleAccept}
					onReject={handleReject}
					onUndo={handleUndo}
				/>
			))}
		</div>
	);
}
