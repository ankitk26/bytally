import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export default function GroupsForm() {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const { mutate, isPending } = useMutation({
		mutationFn: useConvexMutation(api.groups.create),
	});

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name.trim()) return;

		mutate(
			{ name, description, groupMembers: [] },
			{
				onSuccess: () => {
					setName("");
					setDescription("");
				},
			},
		);
	};

	return (
		<div className="border-border border p-5">
			<p className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
				New group
			</p>
			<h2 className="text-foreground mb-4 font-serif text-lg">
				Create a group
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<Label htmlFor="name" className="text-muted-foreground text-xs">
						Name
					</Label>
					<Input
						id="name"
						name="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Marketing Team"
						required
					/>
				</div>

				<div className="space-y-1.5">
					<Label
						htmlFor="description"
						className="text-muted-foreground text-xs"
					>
						Description <span className="opacity-50">(optional)</span>
					</Label>
					<Textarea
						id="description"
						name="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="What's this group about?"
						rows={2}
					/>
				</div>

				<Button
					type="submit"
					disabled={isPending || !name.trim()}
					className="w-full"
				>
					{isPending ? "Creating..." : "Create"}
				</Button>
			</form>
		</div>
	);
}
