import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useState, useMemo } from "react";
import MemberItem from "./member-item";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

type GroupMember = {
	memberId: Id<"users">;
	username: string;
	isAdmin: boolean;
};

type Props = {
	members: GroupMember[];
	hasExpenses?: boolean;
};

export default function GroupBalancesList({ members, hasExpenses }: Props) {
	const { groupId } = useParams({ from: "/_protected/groups/$groupId" });
	const { auth } = useRouteContext({ from: "/_protected" });
	const [isSimplified, setIsSimplified] = useState(false);

	const { data: amountsOwedToMe } = useQuery(
		convexQuery(api.expenseContributors.getAmountsOwedToMeByGroup, {
			groupId: groupId as Id<"groups">,
		}),
	);

	const { data: simplifiedDebts } = useQuery(
		convexQuery(api.expenseContributors.getSimplifiedDebts, {
			groupId: groupId as Id<"groups">,
		}),
	);

	const simplifiedAmounts = useMemo(() => {
		if (!simplifiedDebts) return {};

		const amounts: Record<Id<"users">, number> = {};

		for (const transaction of simplifiedDebts) {
			if (transaction.fromUserId === auth.authUserId) {
				// I owe money to someone (negative)
				amounts[transaction.toUserId] =
					(amounts[transaction.toUserId] || 0) - transaction.amount;
			} else if (transaction.toUserId === auth.authUserId) {
				// Someone owes me money (positive)
				amounts[transaction.fromUserId] =
					(amounts[transaction.fromUserId] || 0) + transaction.amount;
			}
		}

		return amounts;
	}, [simplifiedDebts, auth.authUserId]);

	const displayAmounts = isSimplified ? simplifiedAmounts : amountsOwedToMe;

	const membersWithBalance = members.filter((member) => {
		if (member.memberId === auth.authUserId) return false;
		const amount = displayAmounts?.[member.memberId];
		return amount !== undefined && Math.abs(amount) > 0.01;
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label
					htmlFor="simplify-toggle"
					className="text-muted-foreground cursor-pointer text-sm"
				>
					Simplify
				</Label>
				<Switch
					id="simplify-toggle"
					checked={isSimplified}
					onCheckedChange={setIsSimplified}
				/>
			</div>

			<div className="divide-border border-border divide-y border-y">
				{membersWithBalance.length === 0 ? (
					<p className="text-muted-foreground py-4 text-center text-sm">
						{isSimplified ? "All settled" : "No balances to show"}
					</p>
				) : (
					membersWithBalance.map((member) => (
						<MemberItem
							key={member.memberId}
							member={member}
							amountOwed={displayAmounts?.[member.memberId]}
							groupId={groupId as Id<"groups">}
							hasExpenses={hasExpenses}
						/>
					))
				)}
			</div>
		</div>
	);
}
