import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

type Props = {
	showBorder?: boolean;
};

export default function GroupsForm({ showBorder = true }: Props) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [selectedFriends, setSelectedFriends] = useState<Id<"users">[]>([]);

	const { mutate, isPending } = useMutation({
		mutationFn: useConvexMutation(api.groups.create),
	});

	const { data: friends, isPending: isFriendsLoading } = useQuery(
		convexQuery(api.friends.getAll),
	);

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name.trim()) return;

		mutate(
			{ name, description, groupMembers: selectedFriends },
			{
				onSuccess: () => {
					setName("");
					setDescription("");
					setSelectedFriends([]);
				},
			},
		);
	};

	const toggleFriend = (friendId: Id<"users">) => {
		setSelectedFriends((prev) =>
			prev.includes(friendId)
				? prev.filter((id) => id !== friendId)
				: [...prev, friendId],
		);
	};

	return (
		<div className={showBorder ? "border-border border p-5" : ""}>
			<p className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
				New group
			</p>
			<h2 className="text-foreground mb-4 font-serif text-lg">
				Create a group
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<Label htmlFor="name" className="text-muted-foreground text-xs">
						Name
					</Label>
					<Input
						id="name"
						name="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Marketing Team"
						required
					/>
				</div>

				<div className="space-y-1.5">
					<Label
						htmlFor="description"
						className="text-muted-foreground text-xs"
					>
						Description <span className="opacity-50">(optional)</span>
					</Label>
					<Textarea
						id="description"
						name="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="What's this group about?"
						rows={2}
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-muted-foreground text-xs">
						Group Members <span className="opacity-50">(optional)</span>
					</Label>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="outline"
									className="w-full justify-start"
									disabled={isFriendsLoading}
								>
									{isFriendsLoading ? (
										<HugeiconsIcon
											icon={Loading03Icon}
											className="h-4 w-4 animate-spin"
											strokeWidth={2}
										/>
									) : selectedFriends.length > 0 ? (
										`${selectedFriends.length} member${selectedFriends.length > 1 ? "s" : ""} selected`
									) : (
										"Select friends"
									)}
								</Button>
							}
						/>
						<DropdownMenuContent className="w-[--anchor-width]" align="start">
							<DropdownMenuGroup>
								<DropdownMenuLabel>Friends</DropdownMenuLabel>
								{friends?.length === 0 ? (
									<DropdownMenuCheckboxItem disabled>
										No friends found
									</DropdownMenuCheckboxItem>
								) : (
									friends?.map((friend) => (
										<DropdownMenuCheckboxItem
											key={friend._id}
											checked={selectedFriends.includes(friend._id)}
											onCheckedChange={() => toggleFriend(friend._id)}
										>
											{friend.username}
										</DropdownMenuCheckboxItem>
									))
								)}
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<Button
					type="submit"
					disabled={isPending || !name.trim()}
					className="w-full"
				>
					{isPending ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							className="h-4 w-4 animate-spin"
							strokeWidth={2}
						/>
					) : (
						"Create"
					)}
				</Button>
			</form>
		</div>
	);
}
