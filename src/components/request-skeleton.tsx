import { Skeleton } from "./ui/skeleton";

interface Props {
	count?: number;
}

export default function RequestSkeleton({ count = 3 }: Props) {
	return (
		<div className="divide-border border-border divide-y border-y">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="py-4">
					<div className="flex items-center gap-3">
						<Skeleton className="h-8 w-8" />
						<div className="flex-1">
							<Skeleton className="mb-1.5 h-3.5 w-32" />
							<Skeleton className="h-3 w-24" />
						</div>
						<Skeleton className="h-6 w-20" />
					</div>
				</div>
			))}
		</div>
	);
}
