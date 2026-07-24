import { SpinnerIcon, XIcon } from "@phosphor-icons/react";
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
			<Label className="text-muted-foreground text-xs">Members</Label>
			{members.length === 0 ? (
				<p className="text-muted-foreground text-sm">No members</p>
			) : (
				<div className="divide-border border-border divide-y border-y">
					{members.map((member) => {
						const isCheckingMember = checkingMemberId === member.memberId;

						return (
							<div
								key={member.memberId}
								className="flex items-center justify-between gap-2 py-2"
							>
								<div className="min-w-0 flex-1">
									<p className="text-foreground truncate text-sm font-medium">
										{member.username}
										{member.isAdmin && (
											<span className="text-muted-foreground ml-2 text-xs">
												Admin
											</span>
										)}
										{member.isPlaceholder && (
											<span className="text-muted-foreground ml-2 text-xs">
												Pending
											</span>
										)}
									</p>
									<p className="text-muted-foreground truncate text-xs">
										{member.email}
									</p>
								</div>
								{!member.isAdmin && (
									<Button
										size="icon-xs"
										variant="ghost"
										onClick={() => onRemoveMember(member.memberId)}
										disabled={isRemoveDisabled}
									>
										{isCheckingMember ? (
											<SpinnerIcon className="size-4" />
										) : (
											<XIcon />
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
