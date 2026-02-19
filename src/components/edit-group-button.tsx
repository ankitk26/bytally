import { useConvexMutation } from "@convex-dev/react-query";
import {
	Delete01Icon,
	Loading03Icon,
	PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
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
import { Textarea } from "./ui/textarea";

type Props = {
	groupId: string;
	groupName: string;
	groupDescription?: string;
};

export default function EditGroupButton({
	groupId,
	groupName,
	groupDescription,
}: Props) {
	const [name, setName] = useState(groupName);
	const [description, setDescription] = useState(groupDescription || "");
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const navigate = useNavigate();

	const updateMutation = useMutation({
		mutationFn: useConvexMutation(api.groups.update),
		onSuccess: () => {
			setIsDialogOpen(false);
		},
		onError: (error) => {
			console.error("Failed to update group:", error);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: useConvexMutation(api.groups.deleteGroup),
		onSuccess: () => {
			navigate({ to: "/" });
		},
		onError: (error) => {
			console.error("Failed to delete group:", error);
		},
	});

	const handleUpdate = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		updateMutation.mutate({
			groupId: groupId as Id<"groups">,
			name,
			description,
		});
	};

	const handleDelete = () => {
		deleteMutation.mutate({
			groupId: groupId as Id<"groups">,
		});
	};

	const isUpdating = updateMutation.isPending;
	const isDeleting = deleteMutation.isPending;

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<Tooltip>
				<TooltipTrigger>
					<DialogTrigger
						render={
							<Button size="icon-xs" variant="outline">
								<HugeiconsIcon
									icon={PencilEdit01Icon}
									className="h-3.5 w-3.5"
									strokeWidth={2}
								/>
							</Button>
						}
					/>
				</TooltipTrigger>
				<TooltipContent>Edit group</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Group</DialogTitle>
					<DialogDescription>
						Update the group name and description
					</DialogDescription>
				</DialogHeader>

				<form className="space-y-4 py-4" onSubmit={handleUpdate}>
					<div className="space-y-1.5">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Group name"
							required
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Group description"
						/>
					</div>

					<div className="flex items-center justify-between pt-4">
						<AlertDialog>
							<AlertDialogTrigger
								render={
									<Button
										type="button"
										variant="destructive"
										size="sm"
										disabled={isDeleting}
									>
										<HugeiconsIcon
											icon={Delete01Icon}
											className="mr-1 h-4 w-4"
											strokeWidth={2}
										/>
										Delete group
									</Button>
								}
							/>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Group</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete this group? This action
										cannot be undone. All expenses will be permanently deleted.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										disabled={isDeleting}
									>
										{isDeleting ? (
											<HugeiconsIcon
												icon={Loading03Icon}
												className="h-4 w-4 animate-spin"
												strokeWidth={2}
											/>
										) : (
											"Delete"
										)}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>

						<Button type="submit" disabled={isUpdating}>
							{isUpdating ? (
								<HugeiconsIcon
									icon={Loading03Icon}
									className="h-4 w-4 animate-spin"
									strokeWidth={2}
								/>
							) : (
								"Save changes"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
