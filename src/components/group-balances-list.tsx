import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
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

export default function GroupBalancesList({ members, hasExpenses }: Props) {
	const { groupId } = useParams({ from: "/_protected/groups/$groupId" });
	const { auth } = useRouteContext({ from: "/_protected" });

	const { data: amountsOwedToMe } = useQuery(
		convexQuery(api.expenseContributors.getAmountsOwedToMeByGroup, {
			groupId: groupId as Id<"groups">,
		}),
	);

	const membersWithBalance = members.filter((member) => {
		if (member.memberId === auth.authUserId) return false;
		const amount = amountsOwedToMe?.[member.memberId];
		return amount !== undefined && amount !== 0;
	});

	if (membersWithBalance.length === 0) {
		return (
			<p className="text-muted-foreground py-4 text-center text-sm">
				No balances to show
			</p>
		);
	}

	return (
		<div className="divide-border border-border divide-y border-y">
			{membersWithBalance.map((member) => (
				<MemberItem
					key={member.memberId}
					member={member}
					amountOwed={amountsOwedToMe?.[member.memberId]}
					groupId={groupId as Id<"groups">}
					hasExpenses={hasExpenses}
				/>
			))}
		</div>
	);
}
