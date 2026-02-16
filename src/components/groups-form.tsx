import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useState } from "react";

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
				<div>
					<label
						htmlFor="name"
						className="text-muted-foreground mb-1.5 block text-xs"
					>
						Name
					</label>
					<input
						id="name"
						name="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Marketing Team"
						className="border-border text-foreground placeholder:text-muted-foreground/50 focus:border-foreground w-full border-b bg-transparent py-1.5 text-sm transition-colors focus:outline-none"
						required
					/>
				</div>

				<div>
					<label
						htmlFor="description"
						className="text-muted-foreground mb-1.5 block text-xs"
					>
						Description <span className="opacity-50">(optional)</span>
					</label>
					<textarea
						id="description"
						name="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="What's this group about?"
						rows={2}
						className="border-border text-foreground placeholder:text-muted-foreground/50 focus:border-foreground w-full resize-none border-b bg-transparent py-1.5 text-sm transition-colors focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					disabled={isPending || !name.trim()}
					className="bg-foreground text-background w-full py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
				>
					{isPending ? "Creating..." : "Create"}
				</button>
			</form>
		</div>
	);
}
