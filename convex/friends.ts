import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

export const getAll = query({
	handler: async (ctx) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const [asUser1, asUser2] = await Promise.all([
			ctx.db
				.query("friends")
				.withIndex("by_user1", (q) => q.eq("userId1", authUser._id))
				.collect(), // Where current user is the smaller ID
			ctx.db
				.query("friends")
				.withIndex("by_user2", (q) => q.eq("userId2", authUser._id))
				.collect(), // Where current user is the larger ID
		]);

		// Extract friend IDs from both result sets
		const friendIds = [
			...asUser1.map((f) => f.userId2), // friend is the larger ID
			...asUser2.map((f) => f.userId1), // friend is the smaller ID
		];

		// Fetch full user data, filtering out nulls
		const results: Array<{
			_id: Id<"users">;
			email: string;
		}> = [];

		for (const id of friendIds) {
			const friend = await ctx.db.get(id);
			if (friend) {
				results.push({
					_id: friend._id,
					email: friend.email,
				});
			}
		}

		return results;
	},
});
