import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

export const getExpensesByGroupId = query({
	args: {
		groupId: v.id("groups"),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const group = await ctx.db.get(args.groupId);
		if (!group) {
			throw new Error("invalid_request");
		}

		const isGroupMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", args.groupId).eq("memberId", authUser._id),
			)
			.first();

		if (!isGroupMember) {
			throw new Error("invalid_request");
		}

		const expenses = await ctx.db
			.query("expenses")
			.withIndex("by_group", (q) => q.eq("groupId", args.groupId))
			.order("desc")
			.collect();

		return expenses;
	},
});
