import {
	CheckmarkSquare02Icon,
	Cancel02Icon,
	ArrowTurnBackwardIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatRequestDate } from "~/lib/format-date";
import type { Request } from "./request-types";
import { RequestStatusBadge } from "./request-status-badge";
import { Button } from "./ui/button";

interface ReceivedRequestCardProps {
	request: Request;
	index: number;
	onAccept: (id: string) => void;
	onReject: (id: string) => void;
	onUndo: (id: string) => void;
}

export function ReceivedRequestCard({
	request,
	index,
	onAccept,
	onReject,
	onUndo,
}: ReceivedRequestCardProps) {
	return (
		<article className="group flex items-center gap-3 py-4">
			<span className="text-muted-foreground w-5 text-xs tabular-nums">
				{String(index + 1).padStart(2, "0")}
			</span>
			<div className="min-w-0 flex-1">
				<h3 className="text-foreground truncate text-sm font-medium">
					{request.email}
				</h3>
				<p className="text-muted-foreground mt-0.5 text-xs">
					{formatRequestDate(request.createdAt)}
				</p>
			</div>
			<div className="flex items-center gap-2">
				{request.status === "pending" ? (
					<>
						<Button
							size="xs"
							variant="outline"
							onClick={() => onReject(request.id)}
						>
							<HugeiconsIcon
								icon={Cancel02Icon}
								className="h-3 w-3"
								strokeWidth={2}
							/>
							<span className="sr-only sm:not-sr-only sm:ml-1">Reject</span>
						</Button>
						<Button size="xs" onClick={() => onAccept(request.id)}>
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
						<Button
							size="xs"
							variant="ghost"
							onClick={() => onUndo(request.id)}
						>
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
