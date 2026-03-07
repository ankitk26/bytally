import { convexQuery } from "@convex-dev/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { formatCurrency } from "~/lib/format-currency";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

type Transaction = {
	fromUserId: Id<"users">;
	toUserId: Id<"users">;
	amount: number;
};

type Props = {
	members: Array<{
		memberId: Id<"users">;
		username: string;
		isAdmin: boolean;
	}>;
};

export default function SimplifiedBalancesList({ members }: Props) {
	const { groupId } = useParams({ from: "/_protected/groups/$groupId" });
	const { auth } = useRouteContext({ from: "/_protected" });

	const { data: simplifiedDebts } = useQuery(
		convexQuery(api.expenseContributors.getSimplifiedDebts, {
			groupId: groupId as Id<"groups">,
		}),
	);

	const settleMutation = useMutation({
		mutationFn: useConvexMutation(api.expenseContributors.settleWithUser),
	});

	const memberMap = new Map(members.map((m) => [m.memberId, m.username]));

	const handleSettle = (otherUserId: Id<"users">) => {
		settleMutation.mutate({
			groupId: groupId as Id<"groups">,
			otherUserId,
			settled: true,
		});
	};

	if (!simplifiedDebts || simplifiedDebts.length === 0) {
		return (
			<p className="text-muted-foreground py-4 text-center text-sm">
				All settled
			</p>
		);
	}

	const currentUserId = auth.authUserId;

	return (
		<div className="divide-border border-border divide-y border-y">
			{simplifiedDebts.map((transaction: Transaction, index: number) => {
				const fromUsername = memberMap.get(transaction.fromUserId) || "Unknown";
				const toUsername = memberMap.get(transaction.toUserId) || "Unknown";
				const formattedAmount = formatCurrency(transaction.amount);

				const isFromCurrentUser = transaction.fromUserId === currentUserId;
				const isToCurrentUser = transaction.toUserId === currentUserId;

				let displayText: string;
				let settleTargetId: Id<"users"> | null = null;

				if (isFromCurrentUser) {
					displayText = `You pay ${formattedAmount} to ${toUsername}`;
					settleTargetId = transaction.toUserId;
				} else if (isToCurrentUser) {
					displayText = `${fromUsername} pays you ${formattedAmount}`;
					settleTargetId = transaction.fromUserId;
				} else {
					displayText = `${fromUsername} pays ${toUsername} ${formattedAmount}`;
				}

				return (
					<div
						key={index}
						className="flex items-center justify-between gap-2 py-3"
					>
						<div className="flex min-w-0 flex-1 items-center gap-2">
							<div className="bg-muted flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
								{fromUsername.charAt(0).toUpperCase()}
							</div>
							<span className="text-muted-foreground text-xs">→</span>
							<div className="bg-muted flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
								{toUsername.charAt(0).toUpperCase()}
							</div>
							<span className="text-foreground min-w-0 flex-1 truncate text-sm">
								{displayText}
							</span>
						</div>
						{settleTargetId && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleSettle(settleTargetId!)}
								disabled={settleMutation.isPending}
								className={cn(
									"h-6 px-2 text-xs",
									isFromCurrentUser
										? "text-destructive hover:text-destructive"
										: "text-primary hover:text-primary",
								)}
							>
								{isFromCurrentUser ? "Pay" : "Received"}
							</Button>
						)}
					</div>
				);
			})}
		</div>
	);
}
