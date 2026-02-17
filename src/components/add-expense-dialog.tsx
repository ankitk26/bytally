import { useConvexMutation } from "@convex-dev/react-query";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface Member {
	_id: Id<"users">;
	email: string;
}

interface Props {
	members: Member[];
}

export function AddExpenseDialog({ members }: Props) {
	const { groupId } = useParams({ from: "/_protected/groups/$groupId" });
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");

	const createExpenseMutation = useMutation({
		mutationFn: useConvexMutation(api.expenses.create),
		onSuccess: () => {
			handleClose();
		},
	});

	const handleSubmit = () => {
		if (!selectedMember || !title || !amount) return;

		createExpenseMutation.mutate({
			groupId: groupId as Id<"groups">,
			paidBy: selectedMember._id,
			expenseTime: Date.now(),
			title: title.trim(),
			description: description.trim() || undefined,
			amount: Number.parseFloat(amount),
		});
	};

	const handleClose = () => {
		setSelectedMember(null);
		setTitle("");
		setDescription("");
		setAmount("");
	};

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button size="sm" variant="outline">
						<HugeiconsIcon
							icon={Add01Icon}
							className="mr-1.5 h-3.5 w-3.5"
							strokeWidth={2}
						/>
						Add expense
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Expense</DialogTitle>
					<DialogDescription>
						Add a new expense to this group.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="paid-by">Paid by</Label>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button variant="outline" className="w-full justify-start">
										{selectedMember ? (
											<>
												<div className="bg-muted mr-2 flex h-4 w-4 items-center justify-center rounded text-[10px] font-medium">
													{selectedMember.email.charAt(0).toUpperCase()}
												</div>
												<span className="truncate">{selectedMember.email}</span>
											</>
										) : (
											<span className="text-muted-foreground">
												Select a member
											</span>
										)}
									</Button>
								}
							/>
							<DropdownMenuContent align="start" className="w-[--anchor-width]">
								{members.map((member) => (
									<DropdownMenuItem
										key={member._id}
										onClick={() => setSelectedMember(member)}
									>
										<div className="bg-muted mr-2 flex h-4 w-4 items-center justify-center rounded text-[10px] font-medium">
											{member.email.charAt(0).toUpperCase()}
										</div>
										<span className="truncate">{member.email}</span>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g., Dinner at restaurant"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="amount">Amount (INR)</Label>
						<Input
							id="amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							min="0"
							step="0.01"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="description">
							Description{" "}
							<span className="text-muted-foreground font-normal">
								(optional)
							</span>
						</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add any additional details..."
							rows={3}
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose
						render={
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
						}
					/>
					<DialogClose
						render={
							<Button
								onClick={handleSubmit}
								disabled={!selectedMember || !title || !amount}
							>
								Add Expense
							</Button>
						}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
