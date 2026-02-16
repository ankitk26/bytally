import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
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
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor="name">Name</label>
				<input
					id="name"
					name="name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Enter group name"
				/>
			</div>
			<div>
				<label htmlFor="description">Description</label>
				<textarea
					id="description"
					name="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Enter group description"
					rows={4}
				/>
			</div>
			<button type="submit" disabled={isPending}>
				{isPending ? "Creating..." : "Create Group"}
			</button>
		</form>
	);
}
