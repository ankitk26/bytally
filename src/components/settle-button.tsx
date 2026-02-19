import type { Id } from "convex/_generated/dataModel";
import { useConvexMutation } from "@convex-dev/react-query";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Button } from "~/components/ui/button";

type Props = {
	groupId: Id<"groups">;
	memberId: Id<"users">;
	amountOwed: number;
};

export default function SettleButton({ groupId, memberId, amountOwed }: Props) {
	const settleMutation = useMutation({
		mutationFn: useConvexMutation(api.expenseContributors.settleWithUser),
	});

	if (amountOwed > 0) {
		return null;
	}

	return (
		<Button
			variant={amountOwed === 0 ? "default" : "outline"}
			size="icon-xs"
			className={
				amountOwed === 0
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
			disabled={settleMutation.isPending}
		>
			<HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} />
		</Button>
	);
}
