import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import ExpenseItem from "~/components/expense-item";
import type { GroupMember } from "~/types";

type Props = {
	expenses: FunctionReturnType<typeof api.expenses.getExpensesByGroupId>;
	members: GroupMember[];
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
