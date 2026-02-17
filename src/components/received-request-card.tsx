import { useConvexMutation } from "@convex-dev/react-query";
import {
	ArrowTurnBackwardIcon,
	Cancel02Icon,
	CheckmarkSquare02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { formatRequestDate } from "~/lib/format-date";
import { RequestStatusBadge } from "./request-status-badge";
import { Button } from "./ui/button";

interface Props {
	request: FunctionReturnType<typeof api.requests.getReceivedRequests>[0];
	index: number;
}

export function ReceivedRequestCard({ request, index }: Props) {
	const { mutate } = useMutation({
		mutationFn: useConvexMutation(api.requests.updateRequestStatus),
	});

	const handleAccept = () => {
		mutate({ requestId: request._id, updatedStatus: "accepted" });
	};

	const handleReject = () => {
		mutate({ requestId: request._id, updatedStatus: "rejected" });
	};

	const handleUndo = () => {
		mutate({ requestId: request._id, updatedStatus: "pending" });
	};

	return (
		<article className="group flex items-center gap-3 py-4">
			<span className="text-muted-foreground w-5 text-xs tabular-nums">
				{String(index + 1).padStart(2, "0")}
			</span>
			<div className="min-w-0 flex-1">
				<h3 className="text-foreground truncate text-sm font-medium">
					{request.initiator.email}
				</h3>
				<p className="text-muted-foreground mt-0.5 text-xs">
					{formatRequestDate(request._creationTime)}
				</p>
			</div>
			<div className="flex items-center gap-2">
				{request.status === "pending" ? (
					<>
						<Button size="xs" variant="outline" onClick={handleReject}>
							<HugeiconsIcon
								icon={Cancel02Icon}
								className="h-3 w-3"
								strokeWidth={2}
							/>
							<span className="sr-only sm:not-sr-only sm:ml-1">Reject</span>
						</Button>
						<Button size="xs" onClick={handleAccept}>
							<HugeiconsIcon
								icon={CheckmarkSquare02Icon}
								className="h-3 w-3"
								strokeWidth={2}
							/>
							<span className="sr-only sm:not-sr-only sm:ml-1">Accept</span>
						</Button>
					</>
				) : (
					<>
						<RequestStatusBadge status={request.status} />
						<Button size="xs" variant="ghost" onClick={handleUndo}>
							<HugeiconsIcon
								icon={ArrowTurnBackwardIcon}
								className="h-3 w-3"
								strokeWidth={2}
							/>
							<span className="sr-only sm:not-sr-only sm:ml-1">Undo</span>
						</Button>
					</>
				)}
			</div>
		</article>
	);
}
