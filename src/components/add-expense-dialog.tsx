import { useConvexMutation } from "@convex-dev/react-query";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
	const [contributorIds, setContributorIds] = useState<Id<"users">[]>([]);
	const [splitMode, setSplitMode] = useState<"equal" | "manual">("equal");
	const [manualSplits, setManualSplits] = useState<Record<Id<"users">, string>>(
		{},
	);

	const amountNumber = Number.parseFloat(amount);
	const safeAmount = Number.isFinite(amountNumber) ? amountNumber : 0;
	const selectedContributors = members.filter((member) =>
		contributorIds.includes(member._id),
	);
	const equalShare =
		selectedContributors.length > 0
			? safeAmount / selectedContributors.length
			: 0;
	const manualTotal = selectedContributors.reduce((sum, member) => {
		const value = Number.parseFloat(manualSplits[member._id] ?? "");
		return sum + (Number.isFinite(value) ? value : 0);
	}, 0);
	const remainingBalance = safeAmount - manualTotal;
	const isManualTotalValid =
		splitMode !== "manual" || manualTotal <= safeAmount;

	const createExpenseMutation = useMutation({
		mutationFn: useConvexMutation(api.expenses.create),
		onSuccess: () => {
			resetExpenseForm();
		},
	});

	const handleSubmit = () => {
		if (!selectedMember || !title || !amount) return;

		let finalContributions: Array<{ memberId: Id<"users">; amount: number }>;

		if (splitMode === "equal") {
			finalContributions = contributorIds.map((memberId) => ({
				memberId,
				amount: equalShare,
			}));
		} else {
			finalContributions = contributorIds.map((memberId) => {
				const value = Number.parseFloat(manualSplits[memberId] ?? "");
				return {
					memberId,
					amount: Number.isFinite(value) ? value : 0,
				};
			});
		}

		createExpenseMutation.mutate({
			groupId: groupId as Id<"groups">,
			paidBy: selectedMember._id,
			expenseTime: Date.now(),
			title: title.trim(),
			description: description.trim() || undefined,
			amount: Number.parseFloat(amount),
			splitMode,
			contributions: finalContributions,
		});
	};

	const resetExpenseForm = () => {
		setSelectedMember(null);
		setTitle("");
		setDescription("");
		setAmount("");
		setContributorIds([]);
		setSplitMode("equal");
		setManualSplits({});
	};

	useEffect(() => {
		if (!selectedMember) return;
		setContributorIds((prev) =>
			prev.includes(selectedMember._id) ? prev : [...prev, selectedMember._id],
		);
	}, [selectedMember]);

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
			<DialogContent className="max-h-[85vh] w-[95vw] overflow-y-auto text-sm sm:max-w-lg md:max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-base">Add Expense</DialogTitle>
					<DialogDescription className="text-sm">
						Add a new expense to this group.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
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
						<Label>Contributors</Label>
						<div className="grid gap-1.5 rounded-md border p-2">
							{members.map((member) => (
								<label
									key={member._id}
									className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-2 py-1 text-sm"
								>
									<Checkbox
										checked={contributorIds.includes(member._id)}
										onCheckedChange={(checked) => {
											const isChecked = checked === true;
											setContributorIds((prev) =>
												isChecked
													? prev.includes(member._id)
														? prev
														: [...prev, member._id]
													: prev.filter((id) => id !== member._id),
											);
										}}
									/>
									<span className="truncate">{member.email}</span>
								</label>
							))}
						</div>
						<p className="text-muted-foreground text-xs">
							Choose who shares this expense.
						</p>
					</div>

					<div className="grid gap-2">
						<Label>Split mode</Label>
						<div className="grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant={splitMode === "equal" ? "default" : "outline"}
								onClick={() => setSplitMode("equal")}
							>
								Equal
							</Button>
							<Button
								type="button"
								variant={splitMode === "manual" ? "default" : "outline"}
								onClick={() => setSplitMode("manual")}
							>
								Manual
							</Button>
						</div>
					</div>
					{splitMode === "equal" && (
						<div className="bg-muted/40 rounded-md border p-2 text-sm">
							<div className="flex items-center justify-between gap-2">
								<span className="text-muted-foreground">Contributors</span>
								<span>{selectedContributors.length}</span>
							</div>
							<div className="mt-1 flex items-center justify-between gap-2">
								<span className="text-muted-foreground">Cost per person</span>
								<span>
									{selectedContributors.length > 0
										? equalShare.toFixed(2)
										: "0.00"}
								</span>
							</div>
						</div>
					)}
					{splitMode === "manual" && (
						<div className="grid gap-3">
							<div className="grid gap-2 rounded-md border p-2">
								{selectedContributors.length === 0 && (
									<p className="text-muted-foreground text-sm">
										Select contributors to split manually.
									</p>
								)}
								{selectedContributors.map((member) => (
									<div
										key={member._id}
										className="grid grid-cols-[1fr_120px] items-center gap-2"
									>
										<span className="truncate text-sm">{member.email}</span>
										<Input
											type="number"
											min="0"
											step="0.01"
											value={manualSplits[member._id] ?? ""}
											onChange={(e) =>
												setManualSplits((prev) => ({
													...prev,
													[member._id]: e.target.value,
												}))
											}
											placeholder="0.00"
										/>
									</div>
								))}
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Balance left to split
								</span>
								<span
									className={
										remainingBalance < 0
											? "text-destructive"
											: "text-foreground"
									}
								>
									{remainingBalance.toFixed(2)}
								</span>
							</div>
						</div>
					)}
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
							<Button variant="outline" onClick={resetExpenseForm}>
								Cancel
							</Button>
						}
					/>
					<DialogClose
						render={
							<Button
								onClick={handleSubmit}
								disabled={
									!selectedMember ||
									!title ||
									!amount ||
									contributorIds.length === 0 ||
									!isManualTotalValid
								}
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
