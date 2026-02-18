import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

export const getAmountsOwedToMeByGroup = query({
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

		let amountsOwedToMe: Record<Id<"users">, number> = {};

		const allGroupMembers = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) => q.eq("groupId", args.groupId))
			.collect();

		for (const groupMember of allGroupMembers) {
			if (groupMember.memberId === authUser._id) {
				continue;
			}

			amountsOwedToMe[groupMember.memberId] = 0;

			const expensesPaidByGroupMember = await ctx.db
				.query("expenseContributors")
				.withIndex("by_group_and_payer_and_contributor", (q) =>
					q
						.eq("groupId", args.groupId)
						.eq("payerId", groupMember.memberId)
						.eq("contributorId", authUser._id)
						.eq("isSettled", false),
				)
				.collect();

			for (const expenseContribution of expensesPaidByGroupMember) {
				amountsOwedToMe[groupMember.memberId] -= expenseContribution.amount;
			}

			const expensesPaidByMe = await ctx.db
				.query("expenseContributors")
				.withIndex("by_group_and_payer_and_contributor", (q) =>
					q
						.eq("groupId", args.groupId)
						.eq("payerId", authUser._id)
						.eq("contributorId", groupMember.memberId)
						.eq("isSettled", false),
				)
				.collect();

			for (const expenseContribution of expensesPaidByMe) {
				amountsOwedToMe[groupMember.memberId] += expenseContribution.amount;
			}
		}

		return amountsOwedToMe;
	},
});
