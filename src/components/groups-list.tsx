import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

export default function GroupsList() {
	const { data, isPending } = useQuery(convexQuery(api.groups.getAllGroups));

	if (isPending) {
		return <p>Loading groups...</p>;
	}

	return (
		<div>
			{data?.length === 0 && <p>No groups</p>}
			<div className="flex flex-col gap-3">
				{data?.map((group) => (
					<div key={group._id} className="flex flex-col gap-2 border p-4">
						<h2>{group.name}</h2>
						<p>{group.description}</p>
					</div>
				))}
			</div>
		</div>
	);
}
