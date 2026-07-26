import type { Id } from "convex/_generated/dataModel";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import type { GroupMember } from "~/types";

type Props = {
	members: GroupMember[];
	selectedContributorIds: Id<"users">[];
	onSelectedContributorIdsChange: (contributorIds: Id<"users">[]) => void;
};

export default function ExpenseContributorsCheckboxList({
	members,
	selectedContributorIds,
	onSelectedContributorIdsChange,
}: Props) {
	const areAllMembersSelected =
		selectedContributorIds.length === members.length;

	const toggleAllMembers = () => {
		onSelectedContributorIdsChange(
			areAllMembersSelected ? [] : members.map((member) => member.memberId),
		);
	};

	const toggleSingleMember = (memberId: Id<"users">, isChecked: boolean) => {
		if (isChecked) {
			onSelectedContributorIdsChange(
				selectedContributorIds.includes(memberId)
					? selectedContributorIds
					: [...selectedContributorIds, memberId],
			);
		} else {
			onSelectedContributorIdsChange(
				selectedContributorIds.filter((id) => id !== memberId),
			);
		}
	};

	return (
		<div className="grid gap-3">
			<div className="flex items-center justify-between">
				<Label>Contributors</Label>
				{members.length > 0 && (
					<button
						type="button"
						onClick={toggleAllMembers}
						className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
					>
						{areAllMembersSelected ? "Deselect all" : "Select all"}
					</button>
				)}
			</div>
			<div className="grid gap-1.5 border p-3">
				{members.map((member) => (
					<label
						key={member.memberId}
						className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted/60"
					>
						<Checkbox
							checked={selectedContributorIds.includes(member.memberId)}
							onCheckedChange={(checked) =>
								toggleSingleMember(member.memberId, checked === true)
							}
						/>
						<span className="truncate">{member.username}</span>
					</label>
				))}
			</div>
			<p className="text-xs text-muted-foreground">
				Choose who shares this expense.
			</p>
		</div>
	);
}
