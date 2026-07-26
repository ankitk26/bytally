import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import type { GroupMember } from "~/types";

type Props = {
	members: GroupMember[];
	paidByMember: GroupMember | null;
	onPaidByMemberChange: (member: GroupMember) => void;
};

export default function ExpensePaidByDropdown({
	members,
	paidByMember,
	onPaidByMemberChange,
}: Props) {
	return (
		<div className="grid gap-3">
			<Label>Paid by</Label>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button variant="outline" className="w-full justify-start">
							{paidByMember ? (
								<>
									<div className="mr-2 flex h-4 w-4 items-center justify-center bg-muted text-[10px] font-medium">
										{paidByMember.username.charAt(0).toUpperCase()}
									</div>
									<span className="truncate">{paidByMember.username}</span>
								</>
							) : (
								<span className="text-muted-foreground">Select a member</span>
							)}
						</Button>
					}
				/>
				<DropdownMenuContent align="start" className="w-[--anchor-width]">
					{members.map((member) => (
						<DropdownMenuItem
							key={member.memberId}
							onClick={() => onPaidByMemberChange(member)}
						>
							<div className="mr-2 flex h-4 w-4 items-center justify-center bg-muted text-[10px] font-medium">
								{member.username.charAt(0).toUpperCase()}
							</div>
							<span className="truncate">{member.username}</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
