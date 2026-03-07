import { useConvexMutation } from "@convex-dev/react-query";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";

type Props = {
	groupId: Id<"groups">;
	memberId: Id<"users">;
	amountOwed: number;
	isSimplified?: boolean;
};

export default function SettleButton({
	groupId,
	memberId,
	amountOwed,
	isSimplified = false,
}: Props) {
	const settleMutation = useMutation({
		mutationFn: useConvexMutation(
			isSimplified
				? api.expenseContributors.settleSimplifiedDebt
				: api.expenseContributors.settleWithUser,
		),
	});

	const isInternallySettled = amountOwed === 0;
	const theyOweYou = amountOwed > 0;

	const button = (
		<Button
			variant={isInternallySettled ? "default" : "outline"}
			size="icon-xs"
			className={
				isInternallySettled
					? "text-foreground bg-emerald-600 hover:bg-emerald-800"
					: undefined
			}
			onClick={() =>
				settleMutation.mutate({
					groupId,
					otherUserId: memberId,
					settled: amountOwed !== 0,
				})
			}
			disabled={settleMutation.isPending || isInternallySettled}
		>
			<HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} />
		</Button>
	);

	if (isInternallySettled) {
		return (
			<Tooltip>
				<TooltipTrigger>{button}</TooltipTrigger>
				<TooltipContent>Balanced - no settlement needed</TooltipContent>
			</Tooltip>
		);
	}

	if (theyOweYou) {
		return (
			<Tooltip>
				<TooltipTrigger>{button}</TooltipTrigger>
				<TooltipContent>Mark as received</TooltipContent>
			</Tooltip>
		);
	}

	return button;
}
