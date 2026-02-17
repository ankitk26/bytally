import { convexQuery } from "@convex-dev/react-query";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Skeleton } from "./ui/skeleton";

export default function GroupsList() {
	const { data, isPending } = useQuery(convexQuery(api.groups.getAllGroups));

	if (isPending) {
		return (
			<div className="divide-border border-border divide-y border-y">
				{[1, 2, 3].map((i) => (
					<div key={i} className="py-4">
						<div className="flex items-center gap-3">
							<Skeleton className="h-8 w-8" />
							<div className="flex-1">
								<Skeleton className="mb-1.5 h-3.5 w-28" />
								<Skeleton className="h-3 w-48" />
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
				<Link
					key={group._id}
					to="/groups/$groupId"
					params={{ groupId: group._id }}
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
					<HugeiconsIcon
						icon={ArrowUpRight01Icon}
						className="text-muted-foreground mt-0.5 h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
						strokeWidth={2}
					/>
				</Link>
			))}
		</div>
	);
}
