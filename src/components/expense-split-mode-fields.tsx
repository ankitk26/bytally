import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	computeEqualSharePerContributor,
	computeManualSplitTotal,
	type ExpenseSplitMode,
	type ManualSplitAmounts,
} from "~/lib/expense-split-calculations";
import type { GroupMember } from "~/types";

type Props = {
	splitMode: ExpenseSplitMode;
	onSplitModeChange: (splitMode: ExpenseSplitMode) => void;
	totalAmount: number;
	selectedContributors: GroupMember[];
	manualSplitAmounts: ManualSplitAmounts;
	onManualSplitAmountsChange: (manualSplitAmounts: ManualSplitAmounts) => void;
};

export default function ExpenseSplitModeFields({
	splitMode,
	onSplitModeChange,
	totalAmount,
	selectedContributors,
	manualSplitAmounts,
	onManualSplitAmountsChange,
}: Props) {
	const equalSharePerContributor = computeEqualSharePerContributor(
		totalAmount,
		selectedContributors.length,
	);
	const manualSplitTotal = computeManualSplitTotal(
		selectedContributors.map((member) => member.memberId),
		manualSplitAmounts,
	);
	const remainingBalanceToSplit = totalAmount - manualSplitTotal;

	return (
		<>
			<div className="grid gap-3">
				<Label>Split mode</Label>
				<div className="grid grid-cols-2 gap-2">
					<Button
						type="button"
						variant={splitMode === "equal" ? "default" : "outline"}
						onClick={() => onSplitModeChange("equal")}
					>
						Equal
					</Button>
					<Button
						type="button"
						variant={splitMode === "manual" ? "default" : "outline"}
						onClick={() => onSplitModeChange("manual")}
					>
						Manual
					</Button>
				</div>
			</div>
			{splitMode === "equal" && (
				<div className="border bg-muted/40 p-3 text-sm">
					<div className="flex items-center justify-between gap-2">
						<span className="text-muted-foreground">Contributors</span>
						<span>{selectedContributors.length}</span>
					</div>
					<div className="mt-1 flex items-center justify-between gap-2">
						<span className="text-muted-foreground">Cost per person</span>
						<span>
							{selectedContributors.length > 0
								? equalSharePerContributor.toFixed(2)
								: "0.00"}
						</span>
					</div>
				</div>
			)}
			{splitMode === "manual" && (
				<div className="grid gap-3">
					<div className="grid gap-2 border p-3">
						{selectedContributors.length === 0 && (
							<p className="text-sm text-muted-foreground">
								Select contributors to split manually.
							</p>
						)}
						{selectedContributors.map((member) => (
							<div
								key={member.memberId}
								className="grid grid-cols-[1fr_minmax(80px,120px)] items-center gap-2"
							>
								<span className="truncate text-sm">{member.username}</span>
								<Input
									type="number"
									min="0"
									step="0.01"
									value={manualSplitAmounts[member.memberId] ?? ""}
									onChange={(e) =>
										onManualSplitAmountsChange({
											...manualSplitAmounts,
											[member.memberId]: e.target.value,
										})
									}
									placeholder="0.00"
								/>
							</div>
						))}
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Balance left to split</span>
						<span
							className={
								remainingBalanceToSplit < 0
									? "text-destructive"
									: "text-foreground"
							}
						>
							{remainingBalanceToSplit.toFixed(2)}
						</span>
					</div>
				</div>
			)}
		</>
	);
}
