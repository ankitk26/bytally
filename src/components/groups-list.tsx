import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

export default function GroupsList() {
	const { data, isPending } = useQuery(convexQuery(api.groups.getAllGroups));

	if (isPending) {
		return (
			<div className="divide-border border-border divide-y border-y">
				{[1, 2, 3].map((i) => (
					<div key={i} className="animate-pulse py-4">
						<div className="flex items-center gap-3">
							<div className="bg-muted h-8 w-8 rounded" />
							<div className="flex-1">
								<div className="bg-muted mb-1.5 h-3.5 w-28 rounded" />
								<div className="bg-muted h-3 w-48 rounded" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (data?.length === 0) {
		return (
			<div className="border-border border border-dashed py-12 text-center">
				<p className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
					No groups yet
				</p>
				<p className="text-foreground font-serif text-lg">
					Create your first group
				</p>
			</div>
		);
	}

	return (
		<div className="divide-border border-border divide-y border-y">
			{data?.map((group, index) => (
				<article
					key={group._id}
					className="group flex cursor-pointer items-start gap-3 py-4"
				>
					<span className="text-muted-foreground w-5 pt-0.5 text-xs tabular-nums">
						{String(index + 1).padStart(2, "0")}
					</span>
					<div className="min-w-0 flex-1">
						<h3 className="text-foreground truncate text-sm font-medium underline-offset-2 group-hover:underline">
							{group.name}
						</h3>
						{group.description && (
							<p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
								{group.description}
							</p>
						)}
					</div>
					<svg
						className="text-muted-foreground mt-0.5 h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
						/>
					</svg>
				</article>
			))}
		</div>
	);
}
