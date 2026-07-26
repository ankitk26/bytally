import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { UsersIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMemo, useState } from "react";
import EditGroupMembersAddForm from "~/components/edit-group-members-add-form";
import EditGroupMembersList from "~/components/edit-group-members-list";
import EditGroupMembersRemoveConfirmation, {
	type EditGroupMembersRemoveCheckResult,
} from "~/components/edit-group-members-remove-confirmation";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";

type Props = {
	groupId: string;
};

export default function EditGroupMembersButton({ groupId }: Props) {
	const [removingMemberId, setRemovingMemberId] = useState<Id<"users"> | null>(
		null,
	);
	const [pendingCheck, setPendingCheck] =
		useState<EditGroupMembersRemoveCheckResult | null>(null);
	const [newPayerId, setNewPayerId] = useState<Id<"users"> | null>(null);
	const [isChecking, setIsChecking] = useState(false);

	const { data: members, isPending: isMembersPending } = useQuery(
		convexQuery(api.groupMembers.getMembersByGroup, {
			groupId: groupId as Id<"groups">,
		}),
	);

	const sortedMembersWithAdminFirst = useMemo(
		() =>
			[...(members ?? [])].sort((a, b) => {
				if (a.isAdmin === b.isAdmin) return 0;
				return a.isAdmin ? -1 : 1;
			}),
		[members],
	);

	const removeMemberMutation = useMutation({
		mutationFn: useConvexMutation(api.groupMembers.removeMemberFromGroup),
	});

	const isRemoveDisabled =
		isMembersPending || isChecking || removeMemberMutation.isPending;

	const handleRemoveMemberClick = async (memberId: Id<"users">) => {
		setRemovingMemberId(memberId);
		setIsChecking(true);

		try {
			const result = await removeMemberMutation.mutateAsync({
				groupId: groupId as Id<"groups">,
				memberId,
				confirm: false,
			});

			if (
				result &&
				typeof result === "object" &&
				"needsConfirmation" in result &&
				result.needsConfirmation
			) {
				const checkResult = result as EditGroupMembersRemoveCheckResult;
				setPendingCheck(checkResult);
				setNewPayerId(
					members?.find((m) => m.isAdmin && m.memberId !== memberId)
						?.memberId ??
						members?.find((m) => m.memberId !== memberId)?.memberId ??
						null,
				);
			} else {
				setRemovingMemberId(null);
			}
		} catch {
			setRemovingMemberId(null);
		} finally {
			setIsChecking(false);
		}
	};

	const handleConfirmRemove = async () => {
		if (!removingMemberId) return;

		await removeMemberMutation.mutateAsync({
			groupId: groupId as Id<"groups">,
			memberId: removingMemberId,
			confirm: true,
			newPayerId: newPayerId ?? undefined,
		});

		setRemovingMemberId(null);
		setPendingCheck(null);
		setNewPayerId(null);
	};

	const handleCancelRemove = () => {
		setRemovingMemberId(null);
		setPendingCheck(null);
		setNewPayerId(null);
	};

	return (
		<>
			<Dialog>
				<Tooltip>
					<TooltipTrigger>
						<DialogTrigger
							render={
								<Button size="icon-xs" variant="outline">
									<UsersIcon />
									<span className="sr-only">Modify members</span>
								</Button>
							}
						/>
					</TooltipTrigger>
					<TooltipContent>Modify members</TooltipContent>
				</Tooltip>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Group Members</DialogTitle>
						<DialogDescription>
							Add or remove members by email
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						<EditGroupMembersAddForm groupId={groupId as Id<"groups">} />

						<div className="border-t border-border" />

						{isMembersPending ? (
							<p className="text-sm text-muted-foreground">Loading...</p>
						) : (
							<EditGroupMembersList
								members={sortedMembersWithAdminFirst}
								isRemoveDisabled={isRemoveDisabled}
								checkingMemberId={isChecking ? removingMemberId : null}
								onRemoveMember={handleRemoveMemberClick}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>

			<EditGroupMembersRemoveConfirmation
				isOpen={!!pendingCheck}
				pendingCheck={pendingCheck}
				removingMemberId={removingMemberId}
				newPayerId={newPayerId}
				members={members ?? []}
				isConfirmPending={removeMemberMutation.isPending}
				onNewPayerChange={setNewPayerId}
				onConfirm={handleConfirmRemove}
				onCancel={handleCancelRemove}
			/>
		</>
	);
}
