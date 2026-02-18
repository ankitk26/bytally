import type { Id } from "convex/_generated/dataModel";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { formatCurrency } from "~/lib/format-currency";

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
	const { auth } = useRouteContext({ from: "/_protected" });

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
				<div key={member.memberId} className="flex gap-2 py-3">
					<div className="bg-muted flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
						{member.username.charAt(0).toUpperCase()}
					</div>
					<div className="flex min-w-0 flex-1 flex-col">
						<span className="text-foreground truncate text-sm">
							{member.username}
						</span>
						{auth.authUserId !== member.memberId &&
							amountsOwedToMe?.[member.memberId] !== undefined && (
								<span className="text-muted-foreground text-xs">
									{amountsOwedToMe[member.memberId] < 0
										? `you owe ${formatCurrency(Math.abs(amountsOwedToMe[member.memberId]))}`
										: `owes you ${formatCurrency(Math.abs(amountsOwedToMe[member.memberId]))}`}
								</span>
							)}
					</div>
					{member.isAdmin && (
						<span className="text-muted-foreground text-xs">Admin</span>
					)}
				</div>
			))}
		</div>
	);
}
