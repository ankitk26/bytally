import { RequestStatus } from "~/types";

type Props = {
	status: RequestStatus;
};

export default function RequestStatusBadge({ status }: Props) {
	const styles = {
		pending: "bg-muted text-muted-foreground",
		accepted: "bg-green-100 text-green-700",
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
