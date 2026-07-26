import type { GenericMutationCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * Deletes all records from expenses, expenseContributors, and settlements tables.
 * Use this for data cleanup/reset operations.
 */
export async function deleteAllExpenseData(ctx: MutationCtx): Promise<{
	expensesDeleted: number;
	contributorsDeleted: number;
	settlementsDeleted: number;
}> {
	// Delete all expense contributors
	const contributors = await ctx.db.query("expenseContributors").collect();
	for (const contributor of contributors) {
		await ctx.db.delete(contributor._id);
	}

	// Delete all expenses
	const expenses = await ctx.db.query("expenses").collect();
	for (const expense of expenses) {
		await ctx.db.delete(expense._id);
	}

	// Delete all settlements
	const settlements = await ctx.db.query("settlements").collect();
	for (const settlement of settlements) {
		await ctx.db.delete(settlement._id);
	}

	return {
		expensesDeleted: expenses.length,
		contributorsDeleted: contributors.length,
		settlementsDeleted: settlements.length,
	};
}
