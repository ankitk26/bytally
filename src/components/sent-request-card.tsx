import { formatRequestDate } from "~/lib/format-date";
import type { Request } from "./request-types";
import { RequestStatusBadge } from "./request-status-badge";

interface SentRequestCardProps {
	request: Request;
	index: number;
}

export function SentRequestCard({ request, index }: SentRequestCardProps) {
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
				<RequestStatusBadge status={request.status} />
			</div>
		</article>
	);
}
