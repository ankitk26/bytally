import { useRouteContext } from "@tanstack/react-router";
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
	const { auth } = useRouteContext({ from: "/_protected" });

	// only show amounts to the payer or contributors of this expense
	const isInvolved =
		expense.paidBy === auth.authUserId ||
		expense.contributors.some((c) => c.contributorId === auth.authUserId);

	// amount the payer covered for others (total minus their own share)
	const lentAmount = expense.contributors
		.filter((c) => c.contributorId !== expense.paidBy)
		.reduce((sum, c) => sum + c.amount, 0);

	// the entire row is the dialog trigger — a comfortable touch target on mobile
	const trigger = (
		<article className="group flex cursor-pointer flex-col gap-3 py-3.5 pr-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:bg-muted/60">
			<div className="flex items-center gap-3">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted font-serif text-sm text-muted-foreground sm:h-10 sm:w-10">
					{expense.paidByUsername.charAt(0).toUpperCase()}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline justify-between gap-3">
						<h3 className="min-w-0 truncate text-sm font-medium text-foreground group-hover:underline">
							{expense.title}
						</h3>
						{isInvolved && (
							<span className="shrink-0 text-sm font-semibold text-foreground tabular-nums sm:text-base">
								{formatCurrency(expense.amount)}
							</span>
						)}
					</div>
					<span className="mt-0.5 block text-xs text-muted-foreground/70">
						{formatDate(expense.expenseTime)}
					</span>
				</div>
			</div>
			{isInvolved ? (
				lentAmount > 0.01 && (
					<p className="text-xs break-words text-muted-foreground">
						<span className="break-all">{expense.paidByUsername}</span>
						&nbsp;lent{" "}
						<span className="font-medium text-foreground">
							{formatCurrency(lentAmount)}
						</span>
					</p>
				)
			) : (
				<p className="font-serif text-xs text-muted-foreground">
					You are not involved
				</p>
			)}
		</article>
	);

	return expense.canEdit ? (
		<EditExpenseDialog expense={expense} members={members}>
			{trigger}
		</EditExpenseDialog>
	) : (
		<ViewExpenseDialog expense={expense}>{trigger}</ViewExpenseDialog>
	);
}
