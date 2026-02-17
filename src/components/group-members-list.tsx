import type { Id } from "convex/_generated/dataModel";

interface GroupMember {
	_id: Id<"users">;
	email: string;
	isAdmin: boolean;
}

interface GroupMembersListProps {
	members: GroupMember[];
}

export function GroupMembersList({ members }: GroupMembersListProps) {
	const sortedMembers = [...members].sort((a, b) => {
		if (a.isAdmin === b.isAdmin) return 0;
		return a.isAdmin ? -1 : 1;
	});

	return (
		<div className="divide-border border-border divide-y border-y">
			{sortedMembers.map((member) => (
				<div key={member._id} className="flex items-center gap-2 py-3">
					<div className="bg-muted flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
						{member.email.charAt(0).toUpperCase()}
					</div>
					<div className="min-w-0 flex-1">
						<span className="text-foreground truncate text-sm">
							{member.email}
						</span>
					</div>
					{member.isAdmin && (
						<span className="text-muted-foreground text-xs">Admin</span>
					)}
				</div>
			))}
		</div>
	);
}
