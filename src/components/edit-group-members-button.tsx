import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useState, useEffect } from "react";
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
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import SendRequestForm from "./send-request-form";

type Props = {
	groupId: string;
};

export default function EditGroupMembersButton({ groupId }: Props) {
	const { data: friends, isPending: isFriendsLoading } = useQuery(
		convexQuery(api.friends.getAll),
	);

	const { data: members, isPending: isMembersPending } = useQuery(
		convexQuery(api.groupMembers.getMembersByGroup, {
			groupId: groupId as Id<"groups">,
		}),
	);

	const addMemberMutation = useMutation({
		mutationFn: useConvexMutation(api.groupMembers.addMemberToGroup),
	});

	const removeMemberMutation = useMutation({
		mutationFn: useConvexMutation(api.groupMembers.removeMemberFromGroup),
	});

	const [originalMemberIds, setOriginalMemberIds] = useState<string[]>([]);
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

	useEffect(() => {
		if (members) {
			const memberIds = members.map((member) => member._id);
			setOriginalMemberIds(memberIds);
			setSelectedMemberIds(memberIds);
		}
	}, [members]);

	const removedMemberIds = originalMemberIds.filter(
		(id) => !selectedMemberIds.includes(id),
	);

	const addedMemberIds = selectedMemberIds.filter(
		(id) => !originalMemberIds.includes(id),
	);

	const toggleMember = (friendId: string) => {
		setSelectedMemberIds((prev) => {
			if (prev.includes(friendId)) {
				return prev.filter((id) => id !== friendId);
			} else {
				return [...prev, friendId];
			}
		});
	};

	const isSaving =
		addMemberMutation.isPending || removeMemberMutation.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (addedMemberIds.length > 0) {
				await addMemberMutation.mutateAsync({
					groupId: groupId as Id<"groups">,
					memberIds: addedMemberIds as Id<"users">[],
				});
			}

			if (removedMemberIds.length > 0) {
				await removeMemberMutation.mutateAsync({
					groupId: groupId as Id<"groups">,
					memberIds: removedMemberIds as Id<"users">[],
				});
			}

			setOriginalMemberIds([...selectedMemberIds]);
			console.log("Members updated successfully");
		} catch (error) {
			console.error("Failed to update members:", error);
		}
	};

	return (
		<Dialog>
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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Group Members</DialogTitle>
					<DialogDescription>
						Add or remove members from this group
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<form className="space-y-3" onSubmit={handleSubmit}>
						<div className="space-y-1.5">
							<Label className="text-muted-foreground text-xs">
								Select Members
							</Label>
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant="outline" className="w-full justify-start">
											Select/Unselect members
										</Button>
									}
								/>
								<DropdownMenuContent className="w-56" align="start">
									<DropdownMenuGroup>
										<DropdownMenuLabel>Friends</DropdownMenuLabel>
										{!isFriendsLoading &&
											!isMembersPending &&
											members &&
											friends?.map((friend) => (
												<DropdownMenuCheckboxItem
													key={friend._id}
													checked={selectedMemberIds.includes(friend._id)}
													onCheckedChange={() => toggleMember(friend._id)}
												>
													{friend.username}
												</DropdownMenuCheckboxItem>
											))}
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<Button type="submit" className="w-full" disabled={isSaving}>
							{isSaving ? "Saving..." : "Save changes"}
						</Button>
					</form>

					<div className="border-border border-t" />

					<div className="space-y-1.5">
						<Label className="text-muted-foreground text-xs">
							Invite by Email
						</Label>
						<SendRequestForm />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
