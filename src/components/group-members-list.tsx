import type { Id } from "convex/_generated/dataModel";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import MemberItem from "./member-item";

type GroupMember = {
	memberId: Id<"users">;
	username: string;
	isAdmin: boolean;
};

type Props = {
	members: GroupMember[];
};

export default function GroupMembersList({ members }: Props) {
	const { groupId } = useParams({ from: "/_protected/groups/$groupId" });

	const sortedMembers = [...members].sort((a, b) => {
		if (a.isAdmin === b.isAdmin) return 0;
		return a.isAdmin ? -1 : 1;
	});

	const { data: amountsOwedToMe } = useQuery(
		convexQuery(api.expenseContributors.getAmountsOwedToMeByGroup, {
			groupId: groupId as Id<"groups">,
		}),
	);

	return (
		<div className="divide-border border-border divide-y border-y">
			{sortedMembers.map((member) => (
				<MemberItem
					key={member.memberId}
					member={member}
					amountOwed={amountsOwedToMe?.[member.memberId]}
					groupId={groupId as Id<"groups">}
				/>
			))}
		</div>
	);
}
