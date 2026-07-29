import { SpinnerIcon, TrashIcon } from "@phosphor-icons/react";
import { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

type Member = {
	memberId: Id<"users">;
	username: string;
	email: string;
	isAdmin: boolean;
	isPlaceholder: boolean;
};

type Props = {
	members: Member[];
	isRemoveDisabled: boolean;
	checkingMemberId: Id<"users"> | null;
	onRemoveMember: (memberId: Id<"users">) => void;
};

export default function EditGroupMembersList({
	members,
	isRemoveDisabled,
	checkingMemberId,
	onRemoveMember,
}: Props) {
	return (
		<div className="space-y-3">
			<Label className="text-xs text-muted-foreground">Members</Label>
			{members.length === 0 ? (
				<p className="text-sm text-muted-foreground">No members</p>
			) : (
				<div className="divide-y divide-border border-y border-border">
					{members.map((member) => {
						const isCheckingMember = checkingMemberId === member.memberId;

						return (
							<div
								key={member.memberId}
								className="flex items-center justify-between gap-2 py-2"
							>
								<div className="min-w-0 flex-1">
									<div className="flex min-w-0 items-baseline gap-2">
										<p className="min-w-0 truncate text-sm font-medium text-foreground">
											{member.username}
										</p>
										{member.isAdmin && (
											<span className="shrink-0 text-xs text-muted-foreground">
												Admin
											</span>
										)}
										{member.isPlaceholder && (
											<span className="shrink-0 text-xs text-muted-foreground">
												Pending
											</span>
										)}
									</div>
									<p className="truncate text-xs text-muted-foreground">
										{member.email}
									</p>
								</div>
								{!member.isAdmin && (
									<Button
										size="icon-xs"
										variant="destructive"
										onClick={() => onRemoveMember(member.memberId)}
										disabled={isRemoveDisabled}
									>
										{isCheckingMember ? (
											<SpinnerIcon className="size-4 animate-spin" />
										) : (
											<TrashIcon />
										)}
										<span className="sr-only">Remove</span>
									</Button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
