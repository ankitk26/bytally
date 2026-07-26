import { useConvexMutation } from "@convex-dev/react-query";
import { CheckIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";

type Props = {
	groupId: Id<"groups">;
	memberId: Id<"users">;
	amountOwed: number;
};

export default function SettleButton({ groupId, memberId, amountOwed }: Props) {
	const { auth } = useRouteContext({ from: "/_protected" });

	const settleMutation = useMutation({
		mutationFn: useConvexMutation(api.expenseContributors.settleSimplifiedDebt),
	});

	const currentUserId = auth.authUserId;
	const iOweThem = amountOwed < 0;

	if (!currentUserId || !iOweThem) {
		return null;
	}

	return (
		<Button
			variant="outline"
			size="icon-xs"
			onClick={() =>
				settleMutation.mutate({
					groupId,
					fromUserId: currentUserId,
					toUserId: memberId,
				})
			}
			disabled={settleMutation.isPending}
		>
			<CheckIcon />
		</Button>
	);
}
