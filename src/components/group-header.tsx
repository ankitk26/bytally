import { Invoice01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { formatDate } from "~/lib/format-date";

interface Props {
	group: FunctionReturnType<typeof api.groups.getById>;
}

export default function GroupHeader({ group }: Props) {
	return (
		<div className="mb-8">
			<div className="flex items-start gap-4">
				<div className="relative shrink-0">
					<div className="bg-muted border-border flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border">
						{group.coverImageUrl ? (
							<img
								src={group.coverImageUrl}
								alt={group.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<HugeiconsIcon
								icon={Invoice01Icon}
								className="text-muted-foreground h-10 w-10"
								strokeWidth={1.5}
							/>
						)}
					</div>
				</div>
				<div className="min-w-0 flex-1">
					<h1 className="text-foreground font-serif text-xl">{group.name}</h1>
					<p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
						{group?.description}
					</p>
					<div className="mt-2 text-xs">
						<span className="text-muted-foreground">Created at </span>
						<span className="text-foreground">
							{formatDate(group._creationTime ?? 0)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
