import type { Id } from "convex/_generated/dataModel";
import { formatDate } from "~/lib/format-date";

interface Expense {
	_id: Id<"expenses">;
	title: string;
	description?: string;
	amount: number;
	paidBy: string;
	expenseTime: number;
}

interface ExpensesListProps {
	expenses: Expense[];
}

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function ExpensesList({ expenses }: ExpensesListProps) {
	return (
		<div className="divide-border border-border divide-y border-y">
			{expenses.map((expense) => (
				<article
					key={expense._id}
					className="flex items-center justify-between gap-3 py-3"
				>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<h3 className="text-foreground truncate text-sm font-medium">
								{expense.title}
							</h3>
							<span className="text-muted-foreground text-xs">
								{formatDate(expense.expenseTime)}
							</span>
						</div>
						<div className="mt-1 flex items-center gap-1.5">
							<div className="bg-muted flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none font-medium">
								{expense.paidBy.charAt(0).toUpperCase()}
							</div>
							<span className="text-muted-foreground text-xs">
								{expense.paidBy}
							</span>
						</div>
					</div>
					<div className="text-right">
						<span className="text-foreground text-sm font-semibold">
							{formatCurrency(expense.amount)}
						</span>
					</div>
				</article>
			))}
		</div>
	);
}
