import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	Add01Icon,
	Cancel02Icon,
	Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";

type Props = {
	groupId: string;
};

function parseEmails(input: string): string[] {
	const emails = input
		.split(/[\s,]+/)
		.map((email) => email.trim().toLowerCase())
		.filter((email) => email.length > 0 && email.includes("@"));
	return Array.from(new Set(emails));
}

export default function EditGroupMembersButton({ groupId }: Props) {
	const [emailsInput, setEmailsInput] = useState("");

	const { data: members, isPending: isMembersPending } = useQuery(
		convexQuery(api.groupMembers.getMembersByGroup, {
			groupId: groupId as Id<"groups">,
		}),
	);

	const { data: pendingInvites, isPending: isPendingLoading } = useQuery(
		convexQuery(api.groupMembers.getPendingInvitesByGroup, {
			groupId: groupId as Id<"groups">,
		}),
	);

	const addMembersMutation = useMutation({
		mutationFn: useConvexMutation(api.groupMembers.addMembersByEmail),
	});

	const removeMemberMutation = useMutation({
		mutationFn: useConvexMutation(api.groupMembers.removeMemberFromGroup),
	});

	const cancelPendingMutation = useMutation({
		mutationFn: useConvexMutation(api.groupMembers.cancelPendingInvite),
	});

	const isLoading =
		isMembersPending ||
		isPendingLoading ||
		addMembersMutation.isPending ||
		removeMemberMutation.isPending ||
		cancelPendingMutation.isPending;

	const handleAddMembers = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const emails = parseEmails(emailsInput);
		if (emails.length === 0) return;

		await addMembersMutation.mutateAsync({
			groupId: groupId as Id<"groups">,
			emails,
		});
		setEmailsInput("");
	};

	const handleRemoveMember = (memberId: Id<"users">) => {
		removeMemberMutation.mutate({
			groupId: groupId as Id<"groups">,
			memberIds: [memberId],
		});
	};

	const handleCancelPending = (pendingId: Id<"pendingGroupMembers">) => {
		cancelPendingMutation.mutate({ pendingMemberId: pendingId });
	};

	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger>
					<DialogTrigger
						render={
							<Button size="icon-xs" variant="outline">
								<HugeiconsIcon
									icon={Add01Icon}
									className="h-3.5 w-3.5"
									strokeWidth={2}
								/>
							</Button>
						}
					/>
				</TooltipTrigger>
				<TooltipContent>Add members</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Group Members</DialogTitle>
					<DialogDescription>Add or remove members by email</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<form onSubmit={handleAddMembers} className="space-y-3">
						<Label
							htmlFor="invite-emails"
							className="text-muted-foreground text-xs"
						>
							Add members by email
						</Label>
						<Input
							id="invite-emails"
							type="text"
							value={emailsInput}
							onChange={(e) => setEmailsInput(e.target.value)}
							placeholder="one@email.com, two@email.com"
						/>
						<Button
							type="submit"
							className="w-full"
							disabled={
								addMembersMutation.isPending ||
								parseEmails(emailsInput).length === 0
							}
						>
							{addMembersMutation.isPending ? (
								<HugeiconsIcon
									icon={Loading03Icon}
									className="h-4 w-4 animate-spin"
									strokeWidth={2}
								/>
							) : (
								"Add members"
							)}
						</Button>
					</form>

					<div className="border-border border-t" />

					<div className="space-y-3">
						<Label className="text-muted-foreground text-xs">Members</Label>
						{isMembersPending ? (
							<p className="text-muted-foreground text-sm">Loading...</p>
						) : members?.length === 0 ? (
							<p className="text-muted-foreground text-sm">No members</p>
						) : (
							<div className="divide-border border-border divide-y border-y">
								{members?.map((member) => (
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
											</p>
											<p className="text-muted-foreground truncate text-xs">
												{member.email}
											</p>
										</div>
										{!member.isAdmin && (
											<Button
												size="icon-xs"
												variant="ghost"
												onClick={() => handleRemoveMember(member.memberId)}
												disabled={removeMemberMutation.isPending || isLoading}
											>
												<HugeiconsIcon
													icon={Cancel02Icon}
													className="h-3.5 w-3.5"
													strokeWidth={2}
												/>
												<span className="sr-only">Remove</span>
											</Button>
										)}
									</div>
								))}
							</div>
						)}
					</div>

					{pendingInvites && pendingInvites.length > 0 && (
						<div className="space-y-3">
							<Label className="text-muted-foreground text-xs">
								Pending invites
							</Label>
							<div className="divide-border border-border divide-y border-y">
								{pendingInvites.map((invite) => (
									<div
										key={invite._id}
										className="flex items-center justify-between gap-2 py-2"
									>
										<span className="text-foreground min-w-0 flex-1 truncate text-sm">
											{invite.email}
										</span>
										<Button
											size="icon-xs"
											variant="ghost"
											onClick={() => handleCancelPending(invite._id)}
											disabled={cancelPendingMutation.isPending || isLoading}
										>
											<HugeiconsIcon
												icon={Cancel02Icon}
												className="h-3.5 w-3.5"
												strokeWidth={2}
											/>
											<span className="sr-only">Cancel invite</span>
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
