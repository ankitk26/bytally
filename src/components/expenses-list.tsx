import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { ExpenseItem } from "~/components/expense-item";

interface ExpensesListProps {
	expenses: FunctionReturnType<typeof api.expenses.getExpensesByGroupId>;
}

export function ExpensesList({ expenses }: ExpensesListProps) {
	return (
		<div className="divide-border border-border divide-y border-y">
			{expenses.map((expense) => (
				<ExpenseItem key={expense._id} expense={expense} />
			))}
		</div>
	);
}
