import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
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

type Member = {
	_id: Id<"users">;
	email: string;
};

type Contributor = {
	contributorId: Id<"users">;
	amount: number;
	email: string;
};

type Expense = {
	_id: Id<"expenses">;
	paidBy: Id<"users">;
	title: string;
	description?: string;
	amount: number;
	splitMode: "equal" | "manual";
	canEdit?: boolean;
	contributors: Contributor[];
};

type Props = {
	expense: Expense;
	members: Member[];
	children: React.ReactElement;
};

export default function EditExpenseDialog({
	expense,
	members,
	children,
}: Props) {
	const [open, setOpen] = useState(false);

	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [contributorIds, setContributorIds] = useState<Id<"users">[]>([]);
	const [splitMode, setSplitMode] = useState<"equal" | "manual">("equal");
	const [manualSplits, setManualSplits] = useState<Record<Id<"users">, string>>(
		{},
	);

	useEffect(() => {
		if (open) {
			const paidByMember = members.find((m) => m._id === expense.paidBy);
			setSelectedMember(paidByMember || null);
			setTitle(expense.title);
			setDescription(expense.description || "");
			setAmount(expense.amount.toString());
			setSplitMode(expense.splitMode);
			setContributorIds(expense.contributors.map((c) => c.contributorId));

			const initialManualSplits: Record<Id<"users">, string> = {};
			for (const contributor of expense.contributors) {
				initialManualSplits[contributor.contributorId] =
					contributor.amount.toString();
			}
			setManualSplits(initialManualSplits);
		}
	}, [expense, members, open]);

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

	const updateExpenseMutation = useMutation({
		mutationFn: useConvexMutation(api.expenses.update),
		onSuccess: () => {
			setOpen(false);
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

		updateExpenseMutation.mutate({
			expenseId: expense._id,
			paidBy: selectedMember._id,
			title: title.trim(),
			description: description.trim() || undefined,
			amount: Number.parseFloat(amount),
			splitMode,
			contributions: finalContributions,
		});
	};

	useEffect(() => {
		if (!selectedMember) return;
		setContributorIds((prev) =>
			prev.includes(selectedMember._id) ? prev : [...prev, selectedMember._id],
		);
	}, [selectedMember]);

	if (!expense.canEdit) {
		return <>{children}</>;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={children} />
			<DialogContent className="max-h-[85vh] w-[95vw] overflow-y-auto text-sm sm:max-w-lg md:max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-base">Edit Expense</DialogTitle>
					<DialogDescription className="text-sm">
						Update this expense details.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="edit-title">Title</Label>
						<Input
							id="edit-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g., Dinner at restaurant"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="edit-amount">Amount (INR)</Label>
						<Input
							id="edit-amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							min="0"
							step="0.01"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="edit-paid-by">Paid by</Label>
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
						<Label htmlFor="edit-description">
							Description{" "}
							<span className="text-muted-foreground font-normal">
								(optional)
							</span>
						</Label>
						<Textarea
							id="edit-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add any additional details..."
							rows={3}
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose render={<Button variant="outline">Cancel</Button>} />
					<Button
						onClick={handleSubmit}
						disabled={
							!selectedMember ||
							!title ||
							!amount ||
							contributorIds.length === 0 ||
							!isManualTotalValid ||
							updateExpenseMutation.isPending
						}
					>
						{updateExpenseMutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
