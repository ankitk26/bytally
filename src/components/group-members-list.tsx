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

export default function GroupMembersList({ members, hasExpenses }: Props) {
	const { groupId } = useParams({ from: "/_protected/groups/$groupId" });
	const { auth } = useRouteContext({ from: "/_protected" });
	const [isSimplified, setIsSimplified] = useState(false);

	const sortedMembers = [...members].sort((a, b) => {
		if (a.isAdmin === b.isAdmin) return 0;
		return a.isAdmin ? -1 : 1;
	});

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
				amounts[transaction.toUserId] =
					(amounts[transaction.toUserId] || 0) - transaction.amount;
			} else if (transaction.toUserId === auth.authUserId) {
				amounts[transaction.fromUserId] =
					(amounts[transaction.fromUserId] || 0) + transaction.amount;
			}
		}

		return amounts;
	}, [simplifiedDebts, auth.authUserId]);

	const displayAmounts = isSimplified ? simplifiedAmounts : amountsOwedToMe;

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
				{sortedMembers.map((member) => (
					<MemberItem
						key={member.memberId}
						member={member}
						amountOwed={displayAmounts?.[member.memberId]}
						groupId={groupId as Id<"groups">}
						hasExpenses={hasExpenses}
						isSimplified={isSimplified}
					/>
				))}
			</div>
		</div>
	);
}
