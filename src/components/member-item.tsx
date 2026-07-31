import { useRouteContext } from "@tanstack/react-router";
import type { Id } from "convex/_generated/dataModel";
import { formatCurrency } from "~/lib/format-currency";
import SettleButton from "./settle-button";

type Props = {
	member: {
		memberId: Id<"users">;
		username: string;
		isAdmin: boolean;
	};
	amountOwed: number | undefined;
	groupId: Id<"groups">;
	hasExpenses?: boolean;
};

export default function MemberItem({
	member,
	amountOwed,
	groupId,
	hasExpenses,
}: Props) {
	const { auth } = useRouteContext({ from: "/_protected" });

	const isCurrentUser = auth.authUserId === member.memberId;
	const showAmount =
		!isCurrentUser && amountOwed !== undefined && amountOwed !== 0;
	const showSettleButton =
		!isCurrentUser &&
		amountOwed !== undefined &&
		amountOwed !== 0 &&
		hasExpenses;
	const formattedAmount =
		amountOwed !== undefined ? formatCurrency(Math.abs(amountOwed)) : 0;

	return (
		<div className="flex gap-2 py-3">
			<div className="flex h-6 w-6 items-center justify-center bg-muted text-xs font-medium">
				{member.username.charAt(0).toUpperCase()}
			</div>
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-sm text-foreground">
					{member.username}
				</span>
				{showAmount && (
					<span className="text-xs text-muted-foreground">
						{amountOwed < 0
							? `you owe ${formattedAmount}`
							: `owes you ${formattedAmount}`}
					</span>
				)}
			</div>
			{member.isAdmin && (
				<span className="text-xs text-muted-foreground">Admin</span>
			)}
			{showSettleButton && (
				<SettleButton
					groupId={groupId}
					memberId={member.memberId}
					amountOwed={amountOwed}
					receiverName={member.username}
				/>
			)}
		</div>
	);
}
