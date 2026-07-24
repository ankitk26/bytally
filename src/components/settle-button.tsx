import { useConvexMutation } from "@convex-dev/react-query";
import { CheckIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
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
	const { auth } = useRouteContext({ from: "/_protected" });

	const settleMutation = useMutation({
		mutationFn: useConvexMutation(
			isSimplified
				? api.expenseContributors.settleSimplifiedDebt
				: api.expenseContributors.settleWithUser,
		),
	});

	const isInternallySettled = amountOwed === 0;
	const theyOweYou = amountOwed > 0;
	const iOweThem = amountOwed < 0;
	const simplifiedDebt = {
		fromUserId: (theyOweYou ? memberId : auth.authUserId) as Id<"users">,
		toUserId: (theyOweYou ? auth.authUserId : memberId) as Id<"users">,
		amount: Math.abs(amountOwed),
	};

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
				settleMutation.mutate(
					isSimplified
						? {
								groupId,
								...simplifiedDebt,
							}
						: {
								groupId,
								otherUserId: memberId,
								settled: iOweThem,
							},
				)
			}
			disabled={settleMutation.isPending || isInternallySettled || !iOweThem}
		>
			<CheckIcon />
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
		return null;
	}

	return button;
}
