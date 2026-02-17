import { Skeleton } from "./ui/skeleton";

export default function GroupsPageSkeleton() {
	return (
		<div className="bg-background min-h-screen">
			<main className="mx-auto max-w-6xl px-6 py-8">
				{/* Group Header Skeleton */}
				<div className="mb-8">
					<div className="flex items-start gap-4">
						<Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
						<div className="min-w-0 flex-1">
							<Skeleton className="mb-2 h-6 w-48" />
							<Skeleton className="mb-4 h-4 w-full max-w-md" />
							<div className="flex items-center gap-2">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-4 w-4 rounded-full" />
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-3 w-20" />
							</div>
						</div>
					</div>
				</div>

				{/* Two Column Layout Skeleton */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
					{/* Left Column - Expenses Skeleton */}
					<div className="lg:col-span-3">
						<div className="mb-4 flex items-center justify-between">
							<Skeleton className="h-6 w-20" />
							<Skeleton className="h-8 w-28 rounded-md" />
						</div>

						<div className="divide-border border-border divide-y border-y">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="flex items-center justify-between gap-3 py-3"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-16" />
										</div>
										<div className="mt-1 flex items-center gap-1.5">
											<Skeleton className="h-4 w-4 rounded" />
											<Skeleton className="h-3 w-24" />
										</div>
									</div>
									<Skeleton className="h-4 w-20" />
								</div>
							))}
						</div>
					</div>

					{/* Right Column - Members Skeleton */}
					<div className="lg:col-span-1">
						<div className="mb-4 flex items-center justify-between">
							<Skeleton className="h-6 w-20" />
							<Skeleton className="h-8 w-16 rounded-md" />
						</div>
						<div className="divide-border border-border divide-y border-y">
							{[1, 2, 3, 4, 5].map((i) => (
								<div key={i} className="flex items-center gap-2 py-3">
									<Skeleton className="h-6 w-6 rounded" />
									<Skeleton className="h-4 w-24" />
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
