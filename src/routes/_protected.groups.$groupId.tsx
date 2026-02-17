import { convexQuery } from "@convex-dev/react-query";
import { Invoice01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { ExpensesList } from "~/components/expenses-list";
import { GroupMembersList } from "~/components/group-members-list";
import GroupsPageSkeleton from "~/components/groups-page-skeleton";
import { Button } from "~/components/ui/button";
import { formatDate } from "~/lib/format-date";

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
				<div className="mb-8">
					<div className="flex items-start gap-4">
						<div className="relative shrink-0">
							<div className="bg-muted border-border flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border">
								{group.coverImageUrl ? (
									<img
										src={group.coverImageUrl}
										alt={group.name}
										className="h-full w-full object-cover"
									/>
								) : (
									<HugeiconsIcon
										icon={Invoice01Icon}
										className="text-muted-foreground h-10 w-10"
										strokeWidth={1.5}
									/>
								)}
							</div>
						</div>
						<div className="min-w-0 flex-1">
							<h1 className="text-foreground font-serif text-xl">
								{group.name}
							</h1>
							<p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
								{group?.description}
							</p>
							<div className="mt-2 text-xs">
								<span className="text-muted-foreground">Created at </span>
								<span className="text-foreground">
									{formatDate(group._creationTime ?? 0)}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Two Column Layout */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
					{/* Left Column - Expenses */}
					<div className="lg:col-span-3">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground font-serif text-lg">Expenses</h2>
							<Button size="sm" variant="outline">
								<HugeiconsIcon
									icon={Add01Icon}
									className="mr-1.5 h-3.5 w-3.5"
									strokeWidth={2}
								/>
								Add expense
							</Button>
						</div>
						{expenses && <ExpensesList expenses={expenses} />}
					</div>

					{/* Right Column - Members */}
					<div className="lg:col-span-1">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground font-serif text-lg">Members</h2>
							<Button size="sm" variant="outline">
								<HugeiconsIcon
									icon={Add01Icon}
									className="mr-1.5 h-3.5 w-3.5"
									strokeWidth={2}
								/>
								Add
							</Button>
						</div>
						{members && <GroupMembersList members={members} />}
					</div>
				</div>
			</main>
		</div>
	);
}
