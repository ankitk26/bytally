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

export const getSimplifiedDebts = query({
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

		const allGroupMembers = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) => q.eq("groupId", args.groupId))
			.collect();

		const memberIds = allGroupMembers.map((m) => m.memberId);
		const balances: Record<Id<"users">, number> = {};

		for (const memberId of memberIds) {
			balances[memberId] = 0;
		}

		const allContributions = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_payer_and_contributor", (q) =>
				q.eq("groupId", args.groupId),
			)
			.filter((q) => q.eq(q.field("isSettled"), false))
			.collect();

		for (const contribution of allContributions) {
			balances[contribution.payerId] += contribution.amount;
			balances[contribution.contributorId] -= contribution.amount;
		}

		const debtors: Array<{ userId: Id<"users">; amount: number }> = [];
		const creditors: Array<{ userId: Id<"users">; amount: number }> = [];

		for (const [userId, balance] of Object.entries(balances)) {
			const id = userId as Id<"users">;
			if (balance < -0.01) {
				debtors.push({ userId: id, amount: Math.abs(balance) });
			} else if (balance > 0.01) {
				creditors.push({ userId: id, amount: balance });
			}
		}

		debtors.sort((a, b) => b.amount - a.amount);
		creditors.sort((a, b) => b.amount - a.amount);

		const transactions: Array<{
			fromUserId: Id<"users">;
			toUserId: Id<"users">;
			amount: number;
		}> = [];

		while (debtors.length > 0 && creditors.length > 0) {
			const debtor = debtors[0];
			const creditor = creditors[0];

			const amount = Math.min(debtor.amount, creditor.amount);
			transactions.push({
				fromUserId: debtor.userId,
				toUserId: creditor.userId,
				amount: Math.round(amount * 100) / 100,
			});

			debtor.amount -= amount;
			creditor.amount -= amount;

			if (debtor.amount < 0.01) {
				debtors.shift();
			}
			if (creditor.amount < 0.01) {
				creditors.shift();
			}
		}

		return transactions;
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

export const settleSimplifiedDebt = mutation({
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

		// In simplified settling, we need to settle ALL contributions where:
		// 1. Auth user owes money to anyone (auth user is contributor)
		// 2. Anyone owes money to the other user (other user is payer)
		// This handles the debt chain A -> B -> C when A settles with C

		// Settle contributions where auth user is the contributor (owes money to anyone)
		// Query all contributions first, then filter by isSettled
		const contributionsWhereAuthOwes = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_contributor", (q) =>
				q.eq("groupId", args.groupId).eq("contributorId", authUser._id),
			)
			.collect();

		for (const contribution of contributionsWhereAuthOwes) {
			if (contribution.isSettled !== args.settled) {
				await ctx.db.patch(contribution._id, { isSettled: args.settled });
			}
		}

		// Settle contributions where other user is the payer (is owed money by anyone)
		const contributionsWhereOtherIsPaid = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_payer_and_contributor", (q) =>
				q.eq("groupId", args.groupId).eq("payerId", args.otherUserId),
			)
			.collect();

		for (const contribution of contributionsWhereOtherIsPaid) {
			if (contribution.isSettled !== args.settled) {
				await ctx.db.patch(contribution._id, { isSettled: args.settled });
			}
		}
	},
});
