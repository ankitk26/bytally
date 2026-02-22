import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import AddExpenseDialog from "~/components/add-expense-dialog";
import EditGroupButton from "~/components/edit-group-button";
import EditGroupMembersButton from "~/components/edit-group-members-button";
import ExpensesList from "~/components/expenses-list";
import GroupBalancesList from "~/components/group-balances-list";
import GroupHeader from "~/components/group-header";
import GroupMembersList from "~/components/group-members-list";
import GroupsPageSkeleton from "~/components/groups-page-skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";

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
			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<div className="mb-8 flex items-start justify-between">
					<GroupHeader group={group} />
					<EditGroupButton
						groupId={groupId}
						groupName={group.name}
						groupDescription={group.description}
					/>
				</div>

				{/* Mobile Tabs Layout */}
				<Tabs defaultValue="balances" className="flex-col lg:hidden">
					<TabsList variant="line" className="mb-4">
						<TabsTrigger value="balances">Balances</TabsTrigger>
						<TabsTrigger value="members">Members</TabsTrigger>
					</TabsList>

					<TabsContent value="balances" className="space-y-6">
						<div>
							<h2 className="text-foreground mb-4 font-serif text-lg">
								Balances
							</h2>
							{members && (
								<GroupBalancesList
									members={members}
									hasExpenses={expenses && expenses.length > 0}
								/>
							)}
						</div>

						<div>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-foreground font-serif text-lg">Expenses</h2>
								{members && <AddExpenseDialog members={members} />}
							</div>
							{expenses && members && (
								<ExpensesList expenses={expenses} members={members} />
							)}
						</div>
					</TabsContent>

					<TabsContent value="members">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground font-serif text-lg">Members</h2>
							<EditGroupMembersButton groupId={groupId} />
						</div>
						{members && (
							<GroupMembersList
								members={members}
								hasExpenses={expenses && expenses.length > 0}
							/>
						)}
					</TabsContent>
				</Tabs>

				{/* Desktop Two Column Layout */}
				<div className="hidden grid-cols-1 gap-8 lg:grid lg:grid-cols-4">
					<div className="lg:col-span-3">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground font-serif text-lg">Expenses</h2>
							{members && <AddExpenseDialog members={members} />}
						</div>
						{expenses && members && (
							<ExpensesList expenses={expenses} members={members} />
						)}
					</div>

					<div className="lg:col-span-1">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground font-serif text-lg">Members</h2>
							<EditGroupMembersButton groupId={groupId} />
						</div>
						{members && (
							<GroupMembersList
								members={members}
								hasExpenses={expenses && expenses.length > 0}
							/>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
