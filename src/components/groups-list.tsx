import { convexQuery } from "@convex-dev/react-query";
import { ReceiptIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Skeleton } from "./ui/skeleton";

export default function GroupsList() {
	const { data, isPending } = useQuery(convexQuery(api.groups.getAllGroups));

	if (isPending) {
		return (
			<div className="divide-y divide-border border-y border-border">
				{[1, 2, 3].map((i) => (
					<div key={i} className="py-4">
						<div className="flex items-center gap-3">
							<Skeleton className="h-8 w-8 rounded-none" />
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

	console.log(data)

	if (data?.length === 0) {
		return (
			<div className="border border-dashed border-border py-12 text-center">
				<p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">
					No groups yet
				</p>
				<p className="font-serif text-lg text-foreground">
					Create your first group
				</p>
			</div>
		);
	}

	return (
		<div className="divide-y divide-border border-y border-border">
			{data?.map((group) => (
				<Link
					key={group._id}
					to="/groups/$groupId"
					params={{ groupId: group._id }}
					className="group flex cursor-pointer items-start gap-3 py-4"
				>
					{group.coverImageUrl ? (
						<img
							src={group.coverImageUrl}
							alt={group.name}
							className="h-8 w-8 object-cover"
						/>
					) : (
						<div className="flex h-8 w-8 items-center justify-center bg-muted">
							<ReceiptIcon />
						</div>
					)}
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-sm font-medium text-foreground underline-offset-2 group-hover:underline">
							{group.name}
						</h3>
						{group.description && (
							<p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
								{group.description}
							</p>
						)}
					</div>
				</Link>
			))}
		</div>
	);
}
