import { useConvexMutation } from "@convex-dev/react-query";
import { PlusIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useEffect, useState } from "react";
import ExpenseContributorsCheckboxList from "~/components/expense-contributors-checkbox-list";
import ExpensePaidByDropdown from "~/components/expense-paid-by-dropdown";
import ExpenseSplitModeFields from "~/components/expense-split-mode-fields";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
	buildExpenseContributions,
	computeManualSplitTotal,
	isManualSplitTotalWithinAmount,
	parseExpenseAmount,
	type ExpenseSplitMode,
	type ManualSplitAmounts,
} from "~/lib/expense-split-calculations";
import type { GroupMember } from "~/types";

type Props = {
	members: GroupMember[];
};

export default function AddExpenseDialog({ members }: Props) {
	const { groupId } = useParams({ from: "/_protected/groups/$groupId" });

	const [paidByMember, setPaidByMember] = useState<GroupMember | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [contributorIds, setContributorIds] = useState<Id<"users">[]>([]);
	const [splitMode, setSplitMode] = useState<ExpenseSplitMode>("equal");
	const [manualSplitAmounts, setManualSplitAmounts] =
		useState<ManualSplitAmounts>({});

	const totalAmount = parseExpenseAmount(amount);
	const selectedContributors = members.filter((member) =>
		contributorIds.includes(member.memberId),
	);
	const manualSplitTotal = computeManualSplitTotal(
		contributorIds,
		manualSplitAmounts,
	);
	const isSplitTotalValid = isManualSplitTotalWithinAmount(
		splitMode,
		manualSplitTotal,
		totalAmount,
	);

	const createExpenseMutation = useMutation({
		mutationFn: useConvexMutation(api.expenses.create),
		onSuccess: () => {
			resetExpenseForm();
		},
	});

	const resetExpenseForm = () => {
		setPaidByMember(null);
		setTitle("");
		setDescription("");
		setAmount("");
		setContributorIds([]);
		setSplitMode("equal");
		setManualSplitAmounts({});
	};

	useEffect(() => {
		if (!paidByMember) return;
		setContributorIds((previousIds) =>
			previousIds.includes(paidByMember.memberId)
				? previousIds
				: [...previousIds, paidByMember.memberId],
		);
	}, [paidByMember]);

	const handleSubmit = () => {
		if (!paidByMember || !title || !amount) return;

		createExpenseMutation.mutate({
			groupId: groupId as Id<"groups">,
			paidBy: paidByMember.memberId,
			expenseTime: Date.now(),
			title: title.trim(),
			description: description.trim() || undefined,
			amount: Number.parseFloat(amount),
			splitMode,
			contributions: buildExpenseContributions(
				splitMode,
				contributorIds,
				totalAmount,
				manualSplitAmounts,
			),
		});
	};

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button size="sm">
						<PlusIcon />
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
				<div className="grid gap-6 py-2">
					<div className="grid gap-3">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g., Dinner at restaurant"
						/>
					</div>
					<div className="grid gap-3">
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
					<ExpensePaidByDropdown
						members={members}
						paidByMember={paidByMember}
						onPaidByMemberChange={setPaidByMember}
					/>
					<ExpenseContributorsCheckboxList
						members={members}
						selectedContributorIds={contributorIds}
						onSelectedContributorIdsChange={setContributorIds}
					/>
					<ExpenseSplitModeFields
						splitMode={splitMode}
						onSplitModeChange={setSplitMode}
						totalAmount={totalAmount}
						selectedContributors={selectedContributors}
						manualSplitAmounts={manualSplitAmounts}
						onManualSplitAmountsChange={setManualSplitAmounts}
					/>
					<div className="grid gap-3">
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
									!paidByMember ||
									!title ||
									!amount ||
									contributorIds.length === 0 ||
									!isSplitTotalValid
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
