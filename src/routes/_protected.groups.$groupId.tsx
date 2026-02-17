import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { AddExpenseDialog } from "~/components/add-expense-dialog";
import EditGroupButton from "~/components/edit-group-button";
import EditGroupMembersButton from "~/components/edit-group-members-button";
import { ExpensesList } from "~/components/expenses-list";
import GroupHeader from "~/components/group-header";
import { GroupMembersList } from "~/components/group-members-list";
import GroupsPageSkeleton from "~/components/groups-page-skeleton";

export const Route = createFileRoute("/_protected/groups/$groupId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { groupId } = Route.useParams();
	const { data: group, isPending: isGroupPending } = useQuery(
		convexQuery(api.groups.getById, { groupId: groupId as Id<"groups"> }),
	);
	const { data: expenses, isPending: isExpensesPending } = useQuery(
		convexQuery(api.expenses.getExpensesByGroupId, {
			groupId: groupId as Id<"groups">,
		}),
	);
	const { data: members, isPending: isMembersPending } = useQuery(
		convexQuery(api.groupMembers.getMembersByGroup, {
			groupId: groupId as Id<"groups">,
		}),
	);

	if (isGroupPending || isExpensesPending || isMembersPending) {
		return <GroupsPageSkeleton />;
	}

	if (!group) {
		return null;
	}

	return (
		<div className="min-h-screen">
			<main className="mx-auto max-w-6xl px-6 py-8">
				{/* Group Header Section */}
				<div className="mb-8 flex items-start justify-between">
					<GroupHeader group={group} />
					<EditGroupButton
						groupId={groupId}
						groupName={group.name}
						groupDescription={group.description}
					/>
				</div>

				{/* Two Column Layout */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
					{/* Left Column - Expenses */}
					<div className="lg:col-span-3">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground font-serif text-lg">Expenses</h2>
							{members && <AddExpenseDialog members={members} />}
						</div>
						{expenses && <ExpensesList expenses={expenses} />}
					</div>

					{/* Right Column - Members */}
					<div className="lg:col-span-1">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground font-serif text-lg">Members</h2>
							<EditGroupMembersButton groupId={groupId} />
						</div>
						{members && <GroupMembersList members={members} />}
					</div>
				</div>
			</main>
		</div>
	);
}
