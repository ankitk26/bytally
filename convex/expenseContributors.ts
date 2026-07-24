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

		const allGroupMembers = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) => q.eq("groupId", args.groupId))
			.collect();

		const balances: Record<Id<"users">, number> = {};

		for (const groupMember of allGroupMembers) {
			if (groupMember.memberId === authUser._id) {
				continue;
			}
			balances[groupMember.memberId] = 0;
		}

		const contributions = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_payer_and_contributor", (q) =>
				q.eq("groupId", args.groupId),
			)
			.filter((q) => q.eq(q.field("isSettled"), false))
			.collect();

		for (const contribution of contributions) {
			if (
				contribution.payerId === authUser._id &&
				contribution.contributorId in balances
			) {
				balances[contribution.contributorId] += contribution.amount;
			}
			if (
				contribution.contributorId === authUser._id &&
				contribution.payerId in balances
			) {
				balances[contribution.payerId] -= contribution.amount;
			}
		}

		const settlements = await ctx.db
			.query("settlements")
			.withIndex("by_group", (q) => q.eq("groupId", args.groupId))
			.collect();

		for (const settlement of settlements) {
			if (
				settlement.fromUserId === authUser._id &&
				settlement.toUserId in balances
			) {
				balances[settlement.toUserId] += settlement.amount;
			}
			if (
				settlement.toUserId === authUser._id &&
				settlement.fromUserId in balances
			) {
				balances[settlement.fromUserId] -= settlement.amount;
			}
		}

		const amountsOwedToMe: Record<Id<"users">, number> = {};
		for (const [memberId, balance] of Object.entries(balances)) {
			if (Math.abs(balance) > 0.01) {
				amountsOwedToMe[memberId as Id<"users">] =
					Math.round(balance * 100) / 100;
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

		const contributions = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_payer_and_contributor", (q) =>
				q.eq("groupId", args.groupId),
			)
			.filter((q) => q.eq(q.field("isSettled"), false))
			.collect();

		for (const contribution of contributions) {
			if (memberIds.includes(contribution.payerId)) {
				balances[contribution.payerId] += contribution.amount;
			}
			if (memberIds.includes(contribution.contributorId)) {
				balances[contribution.contributorId] -= contribution.amount;
			}
		}

		const settlements = await ctx.db
			.query("settlements")
			.withIndex("by_group", (q) => q.eq("groupId", args.groupId))
			.collect();

		for (const settlement of settlements) {
			if (memberIds.includes(settlement.fromUserId)) {
				balances[settlement.fromUserId] += settlement.amount;
			}
			if (memberIds.includes(settlement.toUserId)) {
				balances[settlement.toUserId] -= settlement.amount;
			}
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

		if (!args.settled) {
			const latestSettlement = await ctx.db
				.query("settlements")
				.withIndex("by_group_and_from", (q) =>
					q.eq("groupId", args.groupId).eq("fromUserId", authUser._id),
				)
				.filter((q) => q.eq(q.field("toUserId"), args.otherUserId))
				.order("desc")
				.first();

			if (latestSettlement) {
				await ctx.db.delete(latestSettlement._id);
				return;
			}

			const reverseSettlement = await ctx.db
				.query("settlements")
				.withIndex("by_group_and_from", (q) =>
					q.eq("groupId", args.groupId).eq("fromUserId", args.otherUserId),
				)
				.filter((q) => q.eq(q.field("toUserId"), authUser._id))
				.order("desc")
				.first();

			if (reverseSettlement) {
				await ctx.db.delete(reverseSettlement._id);
			}

			return;
		}

		const contributionsWhereIOwe = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_payer_and_contributor", (q) =>
				q
					.eq("groupId", args.groupId)
					.eq("payerId", args.otherUserId)
					.eq("contributorId", authUser._id)
					.eq("isSettled", false),
			)
			.collect();

		const contributionsWhereTheyOwe = await ctx.db
			.query("expenseContributors")
			.withIndex("by_group_and_payer_and_contributor", (q) =>
				q
					.eq("groupId", args.groupId)
					.eq("payerId", authUser._id)
					.eq("contributorId", args.otherUserId)
					.eq("isSettled", false),
			)
			.collect();

		let netAmount = 0;
		for (const contribution of contributionsWhereTheyOwe) {
			netAmount += contribution.amount;
		}
		for (const contribution of contributionsWhereIOwe) {
			netAmount -= contribution.amount;
		}

		netAmount = Math.round(netAmount * 100) / 100;

		if (Math.abs(netAmount) < 0.01) {
			return;
		}

		const fromUserId = netAmount > 0 ? args.otherUserId : authUser._id;
		const toUserId = netAmount > 0 ? authUser._id : args.otherUserId;

		await ctx.db.insert("settlements", {
			groupId: args.groupId,
			fromUserId,
			toUserId,
			amount: Math.abs(netAmount),
			createdBy: authUser._id,
			createdTime: Date.now(),
			type: "direct",
		});
	},
});

export const settleSimplifiedDebt = mutation({
	args: {
		groupId: v.id("groups"),
		fromUserId: v.id("users"),
		toUserId: v.id("users"),
		amount: v.number(),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		if (args.amount <= 0) {
			throw new Error("invalid_request");
		}

		const group = await ctx.db.get(args.groupId);
		if (!group) {
			throw new Error("invalid_request");
		}

		for (const memberId of [args.fromUserId, args.toUserId, authUser._id]) {
			const isGroupMember = await ctx.db
				.query("groupMembers")
				.withIndex("by_group_and_member", (q) =>
					q.eq("groupId", args.groupId).eq("memberId", memberId),
				)
				.first();

			if (!isGroupMember) {
				throw new Error("invalid_request");
			}
		}

		await ctx.db.insert("settlements", {
			groupId: args.groupId,
			fromUserId: args.fromUserId,
			toUserId: args.toUserId,
			amount: Math.round(args.amount * 100) / 100,
			createdBy: authUser._id,
			createdTime: Date.now(),
			type: "simplified",
		});
	},
});
