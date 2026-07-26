import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMemo } from "react";
import MemberItem from "./member-item";

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

	const sortedMembers = [...members].sort((a, b) => {
		if (a.isAdmin === b.isAdmin) return 0;
		return a.isAdmin ? -1 : 1;
	});

	const { data: simplifiedDebts } = useQuery(
		convexQuery(api.expenseContributors.getSimplifiedDebts, {
			groupId: groupId as Id<"groups">,
		}),
	);

	// TEMP DEBUG
	console.log("[debug] authUserId:", auth.authUserId);
	console.log("[debug] simplifiedDebts:", simplifiedDebts);

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

		for (const memberId of Object.keys(amounts)) {
			if (Math.abs(amounts[memberId as Id<"users">]) <= 0.01) {
				delete amounts[memberId as Id<"users">];
			}
		}

		// TEMP DEBUG
		console.log("[debug] simplifiedAmounts:", amounts);

		return amounts;
	}, [simplifiedDebts, auth.authUserId]);

	return (
		<div className="divide-border border-border divide-y border-y">
			{sortedMembers.map((member) => (
				<MemberItem
					key={member.memberId}
					member={member}
					amountOwed={simplifiedAmounts?.[member.memberId]}
					groupId={groupId as Id<"groups">}
					hasExpenses={hasExpenses}
				/>
			))}
		</div>
	);
}
