import { useConvexMutation } from "@convex-dev/react-query";
import { SpinnerIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useEffect, useState } from "react";
import ConfirmDeleteExpenseButton from "~/components/confirm-delete-expense-button";
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

type Contributor = {
	contributorId: Id<"users">;
	amount: number;
	username: string;
};

type Expense = {
	_id: Id<"expenses">;
	paidBy: Id<"users">;
	title: string;
	description?: string;
	amount: number;
	splitMode: ExpenseSplitMode;
	canEdit?: boolean;
	contributors: Contributor[];
};

type Props = {
	expense: Expense;
	members: GroupMember[];
	children: React.ReactElement;
};

export default function EditExpenseDialog({
	expense,
	members,
	children,
}: Props) {
	const [open, setOpen] = useState(false);

	const [paidByMember, setPaidByMember] = useState<GroupMember | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [contributorIds, setContributorIds] = useState<Id<"users">[]>([]);
	const [splitMode, setSplitMode] = useState<ExpenseSplitMode>("equal");
	const [manualSplitAmounts, setManualSplitAmounts] =
		useState<ManualSplitAmounts>({});

	useEffect(() => {
		if (open) {
			const initialPaidByMember = members.find(
				(member) => member.memberId === expense.paidBy,
			);
			setPaidByMember(initialPaidByMember || null);
			setTitle(expense.title);
			setDescription(expense.description || "");
			setAmount(expense.amount.toString());
			setSplitMode(expense.splitMode);
			setContributorIds(expense.contributors.map((c) => c.contributorId));

			const initialManualSplitAmounts: ManualSplitAmounts = {};
			for (const contributor of expense.contributors) {
				initialManualSplitAmounts[contributor.contributorId] =
					contributor.amount.toString();
			}
			setManualSplitAmounts(initialManualSplitAmounts);
		}
	}, [expense, members, open]);

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

	const updateExpenseMutation = useMutation({
		mutationFn: useConvexMutation(api.expenses.update),
		onSuccess: () => {
			setOpen(false);
		},
	});

	const handleSubmit = () => {
		if (!paidByMember || !title || !amount) return;

		updateExpenseMutation.mutate({
			expenseId: expense._id,
			paidBy: paidByMember.memberId,
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

	useEffect(() => {
		if (!paidByMember) return;
		setContributorIds((previousIds) =>
			previousIds.includes(paidByMember.memberId)
				? previousIds
				: [...previousIds, paidByMember.memberId],
		);
	}, [paidByMember]);

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
					<div className="grid gap-2">
						<Label htmlFor="edit-description">
							Description{" "}
							<span className="font-normal text-muted-foreground">
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
					<ConfirmDeleteExpenseButton
						expenseId={expense._id}
						onExpenseDeleted={() => setOpen(false)}
						className="sm:mr-auto"
					/>
					<DialogClose render={<Button variant="outline">Cancel</Button>} />
					<Button
						onClick={handleSubmit}
						disabled={
							!paidByMember ||
							!title ||
							!amount ||
							contributorIds.length === 0 ||
							!isSplitTotalValid ||
							updateExpenseMutation.isPending
						}
					>
						{updateExpenseMutation.isPending ? (
							<SpinnerIcon className="animate-spin" />
						) : (
							"Save Changes"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
