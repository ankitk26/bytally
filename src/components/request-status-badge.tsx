import type { RequestStatus } from "./request-types";

interface RequestStatusBadgeProps {
	status: RequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
	const styles = {
		pending: "bg-muted text-muted-foreground",
		accepted: "bg-primary/10 text-primary",
		rejected: "bg-destructive/10 text-destructive",
	};

	return (
		<span
			className={`inline-flex px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${styles[status]}`}
		>
			{status}
		</span>
	);
}
