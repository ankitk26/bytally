import type { Id } from "convex/_generated/dataModel";
import EditExpenseDialog from "~/components/edit-expense-dialog";
import ViewExpenseDialog from "~/components/view-expense-dialog";
import { formatCurrency } from "~/lib/format-currency";
import { formatDate } from "~/lib/format-date";
import type { GroupMember } from "~/types";

type Contributor = {
	contributorId: Id<"users">;
	amount: number;
	username: string;
};

type Expense = {
	_id: Id<"expenses">;
	title: string;
	description?: string;
	amount: number;
	paidBy: Id<"users">;
	paidByUsername: string;
	expenseTime: number;
	canEdit?: boolean;
	splitMode: "equal" | "manual";
	contributors: Contributor[];
};

type Props = {
	expense: Expense;
	members: GroupMember[];
};

export default function ExpenseItem({ expense, members }: Props) {
	const titleElement = (
		<h3 className="cursor-pointer truncate text-sm font-medium text-foreground hover:underline">
			{expense.title}
		</h3>
	);

	return (
		<article className="flex items-center justify-between gap-3 py-3">
			<div className="min-w-0 flex-1">
				<div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
					{expense.canEdit ? (
						<EditExpenseDialog expense={expense} members={members}>
							{titleElement}
						</EditExpenseDialog>
					) : (
						<ViewExpenseDialog expense={expense}>
							{titleElement}
						</ViewExpenseDialog>
					)}
					<span className="hidden text-xs text-muted-foreground sm:inline">
						{formatDate(expense.expenseTime)}
					</span>
				</div>
				<div className="mt-1 flex items-center gap-1.5">
					<div className="flex h-4 w-4 items-center justify-center bg-muted text-[10px] leading-none font-medium">
						{expense.paidByUsername.charAt(0).toUpperCase()}
					</div>
					<span className="text-xs text-muted-foreground">
						{expense.paidByUsername}
					</span>
					<span className="text-xs text-muted-foreground sm:hidden">
						· {formatDate(expense.expenseTime)}
					</span>
				</div>
			</div>
			<span className="text-sm font-semibold text-foreground">
				{formatCurrency(expense.amount)}
			</span>
		</article>
	);
}
