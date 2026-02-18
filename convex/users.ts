import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

export const update = mutation({
	args: {
		username: v.string(),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		await ctx.db.patch(authUser._id, {
			username: args.username,
			updatedTime: Date.now(),
		});
	},
});
