import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
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

export const settleWithUser = mutation({
	args: {
		groupId: v.id("groups"),
		otherUserId: v.id("users"),
		settled: v.boolean(),
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

		const otherUserIsGroupMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", args.groupId).eq("memberId", args.otherUserId),
			)
			.first();

		if (!otherUserIsGroupMember) {
			throw new Error("invalid_request");
		}

		// Settle/unsettle contributions where auth user is the contributor and other user is the payer
		// (i.e., I owe the other user money)
		const contributionsWhereIOwe = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_payer_and_contributor", (q) =>
				q
					.eq("groupId", args.groupId)
					.eq("payerId", args.otherUserId)
					.eq("contributorId", authUser._id)
					.eq("isSettled", !args.settled),
			)
			.collect();

		for (const contribution of contributionsWhereIOwe) {
			await ctx.db.patch(contribution._id, { isSettled: args.settled });
		}

		// Settle/unsettle contributions where other user is the contributor and auth user is the payer
		// (i.e., the other user owes me money)
		const contributionsWhereTheyOwe = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_payer_and_contributor", (q) =>
				q
					.eq("groupId", args.groupId)
					.eq("payerId", authUser._id)
					.eq("contributorId", args.otherUserId)
					.eq("isSettled", !args.settled),
			)
			.collect();

		for (const contribution of contributionsWhereTheyOwe) {
			await ctx.db.patch(contribution._id, { isSettled: args.settled });
		}
	},
});
