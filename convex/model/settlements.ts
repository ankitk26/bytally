import { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export const SETTLEMENT_EPSILON = 0.01;

export const round2 = (value: number) => Math.round(value * 100) / 100;

export type SimplifiedTransaction = {
	fromUserId: Id<"users">;
	toUserId: Id<"users">;
	amount: number;
};

/**
 * Net balance per member from the full ledger: every contribution row plus
 * every settlement row as an offset (a settlement is money that actually
 * moved, independent of expense rows).
 * Positive = is owed money, negative = owes money.
 */
export const getGroupLedgerBalances = async (
	ctx: QueryCtx,
	groupId: Id<"groups">,
	memberIds: Id<"users">[],
): Promise<Record<Id<"users">, number>> => {
	const balances: Record<Id<"users">, number> = {};
	for (const memberId of memberIds) {
		balances[memberId] = 0;
	}

	const contributions = await ctx.db
		.query("expenseContributors")
		.withIndex("by_group_and_payer_and_contributor", (q) =>
			q.eq("groupId", groupId),
		)
		.collect();

	for (const contribution of contributions) {
		if (memberIds.includes(contribution.payerId)) {
			balances[contribution.payerId] += contribution.amount;
		}
		if (memberIds.includes(contribution.contributorId)) {
			balances[contribution.contributorId] -= contribution.amount;
		}
	}

	const settlements = await ctx.db
		.query("settlements")
		.withIndex("by_group", (q) => q.eq("groupId", groupId))
		.collect();

	for (const settlement of settlements) {
		if (memberIds.includes(settlement.fromUserId)) {
			balances[settlement.fromUserId] += settlement.amount;
		}
		if (memberIds.includes(settlement.toUserId)) {
			balances[settlement.toUserId] -= settlement.amount;
		}
	}

	return balances;
};

/**
 * Greedy debt simplification. Deterministic: ties broken by user id so the
 * client and server always produce the same transaction graph.
 */
export const simplifyBalances = (
	balances: Record<Id<"users">, number>,
): SimplifiedTransaction[] => {
	const debtors: Array<{ userId: Id<"users">; amount: number }> = [];
	const creditors: Array<{ userId: Id<"users">; amount: number }> = [];

	for (const [userId, balance] of Object.entries(balances)) {
		const id = userId as Id<"users">;
		if (balance < -SETTLEMENT_EPSILON) {
			debtors.push({ userId: id, amount: Math.abs(balance) });
		} else if (balance > SETTLEMENT_EPSILON) {
			creditors.push({ userId: id, amount: balance });
		}
	}

	const byAmountDescThenId = (
		a: { userId: Id<"users">; amount: number },
		b: { userId: Id<"users">; amount: number },
	) => b.amount - a.amount || (a.userId < b.userId ? -1 : 1);

	debtors.sort(byAmountDescThenId);
	creditors.sort(byAmountDescThenId);

	const transactions: SimplifiedTransaction[] = [];

	while (debtors.length > 0 && creditors.length > 0) {
		const debtor = debtors[0];
		const creditor = creditors[0];

		const amount = Math.min(debtor.amount, creditor.amount);
		transactions.push({
			fromUserId: debtor.userId,
			toUserId: creditor.userId,
			amount: round2(amount),
		});

		debtor.amount -= amount;
		creditor.amount -= amount;

		if (debtor.amount < SETTLEMENT_EPSILON) {
			debtors.shift();
		}
		if (creditor.amount < SETTLEMENT_EPSILON) {
			creditors.shift();
		}
	}

	return transactions;
};
