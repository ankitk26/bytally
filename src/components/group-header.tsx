import { ReceiptIcon } from "@phosphor-icons/react";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { formatDate } from "~/lib/format-date";

type Props = {
	group: FunctionReturnType<typeof api.groups.getById>;
};

export default function GroupHeader({ group }: Props) {
	return (
		<div className="mb-8">
			<div className="flex items-start gap-4">
				<div className="relative shrink-0">
					<div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-border bg-muted sm:h-20 sm:w-20 lg:h-24 lg:w-24">
						{group.coverImageUrl ? (
							<img
								src={group.coverImageUrl}
								alt={group.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<ReceiptIcon className="h-8 w-8 sm:h-10 sm:w-10" />
						)}
					</div>
				</div>
				<div className="min-w-0 flex-1">
					<h1 className="font-serif text-xl text-foreground">{group.name}</h1>
					<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
