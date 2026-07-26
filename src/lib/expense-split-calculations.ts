import type { Id } from "convex/_generated/dataModel";

export type ExpenseSplitMode = "equal" | "manual";

export type ManualSplitAmounts = Record<Id<"users">, string>;

export function parseExpenseAmount(amount: string): number {
	const parsed = Number.parseFloat(amount);
	return Number.isFinite(parsed) ? parsed : 0;
}

export function computeEqualSharePerContributor(
	amount: number,
	contributorCount: number,
): number {
	return contributorCount > 0 ? amount / contributorCount : 0;
}

export function computeManualSplitTotal(
	contributorIds: Id<"users">[],
	manualSplitAmounts: ManualSplitAmounts,
): number {
	return contributorIds.reduce((sum, memberId) => {
		const value = Number.parseFloat(manualSplitAmounts[memberId] ?? "");
		return sum + (Number.isFinite(value) ? value : 0);
	}, 0);
}

export function isManualSplitTotalWithinAmount(
	splitMode: ExpenseSplitMode,
	manualSplitTotal: number,
	amount: number,
): boolean {
	return splitMode !== "manual" || manualSplitTotal <= amount;
}

export function buildExpenseContributions(
	splitMode: ExpenseSplitMode,
	contributorIds: Id<"users">[],
	amount: number,
	manualSplitAmounts: ManualSplitAmounts,
): Array<{ memberId: Id<"users">; amount: number }> {
	if (splitMode === "equal") {
		const share = computeEqualSharePerContributor(
			amount,
			contributorIds.length,
		);
		return contributorIds.map((memberId) => ({ memberId, amount: share }));
	}

	return contributorIds.map((memberId) => {
		const value = Number.parseFloat(manualSplitAmounts[memberId] ?? "");
		return { memberId, amount: Number.isFinite(value) ? value : 0 };
	});
}
