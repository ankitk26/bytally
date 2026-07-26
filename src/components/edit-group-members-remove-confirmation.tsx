import { SpinnerIcon } from "@phosphor-icons/react";
import { Id } from "convex/_generated/dataModel";
import { useMemo } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export type EditGroupMembersRemoveCheckResult = {
	needsConfirmation: true;
	memberName: string;
	payerExpenses: Array<{ expenseId: Id<"expenses">; title: string }>;
	blockedExpenses: Array<{
		expenseId: Id<"expenses">;
		title: string;
		amount: number;
	}>;
	unsettledContributions: Array<{
		expenseId: Id<"expenses">;
		title: string;
		amount: number;
		otherContributorIds: Id<"users">[];
	}>;
};

type AffectedExpense = {
	expenseId: Id<"expenses">;
	title: string;
	isPayer: boolean;
	amountOwed: number | null;
	absorberIds: Id<"users">[];
};

type Member = {
	memberId: Id<"users">;
	username: string;
	isAdmin: boolean;
};

type Props = {
	isOpen: boolean;
	pendingCheck: EditGroupMembersRemoveCheckResult | null;
	removingMemberId: Id<"users"> | null;
	newPayerId: Id<"users"> | null;
	members: Member[];
	isConfirmPending: boolean;
	onNewPayerChange: (id: Id<"users">) => void;
	onConfirm: () => void;
	onCancel: () => void;
};

export default function EditGroupMembersRemoveConfirmation({
	isOpen,
	pendingCheck,
	removingMemberId,
	newPayerId,
	members,
	isConfirmPending,
	onNewPayerChange,
	onConfirm,
	onCancel,
}: Props) {
	const otherMembers = members.filter(
		(member) => member.memberId !== removingMemberId,
	);

	const affectedExpenses = useMemo<AffectedExpense[]>(() => {
		if (!pendingCheck) return [];

		const map = new Map<Id<"expenses">, AffectedExpense>();

		for (const expense of pendingCheck.payerExpenses) {
			map.set(expense.expenseId, {
				expenseId: expense.expenseId,
				title: expense.title,
				isPayer: true,
				amountOwed: null,
				absorberIds: [],
			});
		}

		for (const contribution of pendingCheck.unsettledContributions) {
			const existing = map.get(contribution.expenseId);
			if (existing) {
				existing.amountOwed = contribution.amount;
				existing.absorberIds = contribution.otherContributorIds;
			} else {
				map.set(contribution.expenseId, {
					expenseId: contribution.expenseId,
					title: contribution.title,
					isPayer: false,
					amountOwed: contribution.amount,
					absorberIds: contribution.otherContributorIds,
				});
			}
		}

		return Array.from(map.values());
	}, [pendingCheck]);

	const getAbsorberNames = (ids: Id<"users">[]): string => {
		const names = ids
			.map((id) => members.find((m) => m.memberId === id)?.username)
			.filter((name): name is string => typeof name === "string");
		if (names.length === 0) return "other members";
		if (names.length === 1) return names[0];
		return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
	};

	const hasBlockedExpenses =
		pendingCheck?.blockedExpenses && pendingCheck.blockedExpenses.length > 0;
	const hasPayerExpenses =
		pendingCheck?.payerExpenses && pendingCheck.payerExpenses.length > 0;
	const hasAffectedExpenses = affectedExpenses.length > 0;
	const canConfirm =
		pendingCheck &&
		!hasBlockedExpenses &&
		hasAffectedExpenses &&
		!(hasPayerExpenses && !newPayerId);

	return (
		<AlertDialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onCancel();
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{pendingCheck
							? `Remove ${pendingCheck.memberName}?`
							: "Remove member?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						Review what will happen to their expenses before removing them.
					</AlertDialogDescription>
				</AlertDialogHeader>

				{pendingCheck && (
					<div className="space-y-4 text-xs">
						{hasBlockedExpenses && (
							<div className="bg-muted space-y-2 rounded-none p-3">
								<p className="font-medium">Cannot remove this member yet</p>
								<p className="text-muted-foreground">
									They are the only person who still owes money on these
									expenses, so their debt cannot be shared with anyone else:
								</p>
								<ul className="text-muted-foreground list-disc space-y-1 pl-4">
									{pendingCheck.blockedExpenses.map((expense) => (
										<li key={expense.expenseId}>
											{expense.title} — ${expense.amount.toFixed(2)}
										</li>
									))}
								</ul>
								<p className="text-muted-foreground">
									Settle these expenses or add another contributor first.
								</p>
							</div>
						)}

						{!hasBlockedExpenses && hasPayerExpenses && (
							<div className="space-y-2">
								<p className="font-medium">New payer</p>
								<p className="text-muted-foreground">
									Choose who should receive repayments for the expenses they
									paid for:
								</p>
								<select
									value={newPayerId ?? ""}
									onChange={(e) =>
										onNewPayerChange(e.target.value as Id<"users">)
									}
									className="bg-background border-border w-full rounded-none border px-2 py-1.5"
								>
									<option value="" disabled>
										Select new payer
									</option>
									{otherMembers.map((member) => (
										<option key={member.memberId} value={member.memberId}>
											{member.username}
											{member.isAdmin ? " (Admin)" : ""}
										</option>
									))}
								</select>
							</div>
						)}

						{!hasBlockedExpenses && hasAffectedExpenses && (
							<div className="space-y-2">
								<p className="font-medium">Affected expenses</p>
								<ul className="space-y-2">
									{affectedExpenses.map((expense) => (
										<li key={expense.expenseId} className="space-y-0.5">
											<p className="text-foreground font-medium">
												{expense.title}
											</p>
											{expense.isPayer && (
												<p className="text-muted-foreground">
													They paid for this. The new payer will receive
													repayments.
												</p>
											)}
											{expense.amountOwed !== null && (
												<p className="text-muted-foreground">
													Their unpaid ${expense.amountOwed.toFixed(2)} share
													will be split among{" "}
													{getAbsorberNames(expense.absorberIds)}.
												</p>
											)}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}

				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancel} disabled={isConfirmPending}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={!canConfirm || isConfirmPending}
					>
						{isConfirmPending ? (
							<SpinnerIcon className="size-4 animate-spin" />
						) : hasBlockedExpenses ? (
							"Cannot remove"
						) : (
							"Remove member"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
