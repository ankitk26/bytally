import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import ExpenseItem from "~/components/expense-item";

type Member = {
	_id: Id<"users">;
	email: string;
};

type Props = {
	expenses: FunctionReturnType<typeof api.expenses.getExpensesByGroupId>;
	members: Member[];
};

export default function ExpensesList({ expenses, members }: Props) {
	return (
		<div className="divide-border border-border divide-y border-y">
			{expenses.map((expense) => (
				<ExpenseItem key={expense._id} expense={expense} members={members} />
			))}
		</div>
	);
}
