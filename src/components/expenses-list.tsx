import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import ExpenseItem from "~/components/expense-item";

type Props = {
	expenses: FunctionReturnType<typeof api.expenses.getExpensesByGroupId>;
};

export default function ExpensesList({ expenses }: Props) {
	return (
		<div className="divide-border border-border divide-y border-y">
			{expenses.map((expense) => (
				<ExpenseItem key={expense._id} expense={expense} />
			))}
		</div>
	);
}
