import { useConvexMutation } from "@convex-dev/react-query";
import { SpinnerIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type Props = {
	groupId: Id<"groups">;
};

function parseEmails(input: string): string[] {
	const emails = input
		.split(/[\s,]+/)
		.map((email) => email.trim().toLowerCase())
		.filter((email) => email.length > 0 && email.includes("@"));
	return Array.from(new Set(emails));
}

export default function EditGroupMembersAddForm({ groupId }: Props) {
	const [emailsInput, setEmailsInput] = useState("");

	const addMembersMutation = useMutation({
		mutationFn: useConvexMutation(api.groupMembers.addMembersByEmail),
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const emails = parseEmails(emailsInput);
		if (emails.length === 0) return;

		await addMembersMutation.mutateAsync({ groupId, emails });
		setEmailsInput("");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<Label htmlFor="invite-emails" className="text-xs text-muted-foreground">
				Add members by email
			</Label>
			<Input
				id="invite-emails"
				type="text"
				value={emailsInput}
				onChange={(e) => setEmailsInput(e.target.value)}
				placeholder="one@email.com, two@email.com"
			/>
			<Button
				type="submit"
				className="w-full"
				disabled={
					addMembersMutation.isPending || parseEmails(emailsInput).length === 0
				}
			>
				{addMembersMutation.isPending ? (
					<SpinnerIcon className="animate-spin" />
				) : (
					"Add members"
				)}
			</Button>
		</form>
	);
}
