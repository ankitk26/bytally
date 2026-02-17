import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { formatDate } from "~/lib/format-date";
import RequestStatusBadge from "./request-status-badge";

interface Props {
	request: FunctionReturnType<typeof api.requests.getSentRequests>[0];
	index: number;
}

export default function SentRequestCard({ request, index }: Props) {
	return (
		<article className="group flex items-center gap-3 py-4">
			<span className="text-muted-foreground w-5 text-xs tabular-nums">
				{String(index + 1).padStart(2, "0")}
			</span>
			<div className="min-w-0 flex-1">
				<h3 className="text-foreground truncate text-sm font-medium">
					{request.receiver.email}
				</h3>
				<p className="text-muted-foreground mt-0.5 text-xs">
					{formatDate(request._creationTime)}
				</p>
			</div>
			<div className="flex items-center gap-2">
				<RequestStatusBadge status={request.status} />
			</div>
		</article>
	);
}
