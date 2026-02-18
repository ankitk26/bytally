import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

		// Fetch payer details for each expense
		const expensesWithPayer = await Promise.all(
			expenses.map(async (expense) => {
				const payer = await ctx.db.get(expense.paidBy);
				return {
					...expense,
					paidByEmail: payer?.email ?? "Unknown",
					canDelete:
						expense.paidBy === authUser._id || expense.addedBy === authUser._id,
				};
			}),
		);

		return expensesWithPayer;
	},
});

export const create = mutation({
	args: {
		groupId: v.id("groups"),
		paidBy: v.id("users"),
		expenseTime: v.number(),
		title: v.string(),
		description: v.optional(v.string()),
		amount: v.number(),
		splitMode: v.union(v.literal("equal"), v.literal("manual")),
		contributions: v.array(
			v.object({ memberId: v.id("users"), amount: v.number() }),
		),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		// Validate amount is positive
		if (args.amount <= 0) {
			throw new ConvexError("invalid_request: amount must be positive");
		}

		// Validate title is not empty
		if (!args.title.trim()) {
			throw new ConvexError("invalid_request: title is required");
		}

		// Check if group exists
		const group = await ctx.db.get(args.groupId);
		if (!group) {
			throw new ConvexError("invalid_request: group not found");
		}

		// Check if auth user is a member of the group
		const isAuthUserMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", args.groupId).eq("memberId", authUser._id),
			)
			.first();

		if (!isAuthUserMember) {
			throw new ConvexError("invalid_request: not a group member");
		}

		// Check if paidBy user is a member of the group
		const isPaidByMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", args.groupId).eq("memberId", args.paidBy),
			)
			.first();

		if (!isPaidByMember) {
			throw new ConvexError(
				"invalid_request: paidBy user is not a group member",
			);
		}

		// Create the expense
		const expenseId = await ctx.db.insert("expenses", {
			groupId: args.groupId,
			paidBy: args.paidBy,
			updatedTime: Date.now(),
			expenseTime: args.expenseTime,
			title: args.title.trim(),
			description: args.description?.trim(),
			amount: args.amount,
			splitMode: args.splitMode,
			addedBy: authUser._id,
		});

		// Process contributions with rounding
		const processedContributions =
			args.splitMode === "equal" && args.contributions.length > 0
				? (() => {
						const count = args.contributions.length;
						const baseShare = Math.floor((args.amount / count) * 100) / 100;

						// All except last get base share
						const roundedShares = args.contributions.slice(0, -1).map((c) => ({
							memberId: c.memberId,
							amount: baseShare,
						}));

						// Last contributor gets remainder-adjusted amount
						const sumOfOthers = baseShare * (count - 1);
						const lastContributor = args.contributions[count - 1];
						roundedShares.push({
							memberId: lastContributor.memberId,
							amount: Math.round((args.amount - sumOfOthers) * 100) / 100,
						});

						return roundedShares;
					})()
				: // Manual mode: just round to 2 decimals
					args.contributions.map((c) => ({
						memberId: c.memberId,
						amount: Math.round(c.amount * 100) / 100,
					}));

		for (const contribution of processedContributions) {
			await ctx.db.insert("expenseContributors", {
				expenseId,
				contributorId: contribution.memberId,
				amount: contribution.amount,
				isSettled: false,
				updatedTime: Date.now(),
			});
		}
	},
});

export const remove = mutation({
	args: {
		expenseId: v.id("expenses"),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const expense = await ctx.db.get(args.expenseId);
		if (!expense) {
			throw new ConvexError("invalid_request: expense not found");
		}

		if (expense.paidBy !== authUser._id && expense.addedBy !== authUser._id) {
			throw new ConvexError(
				"invalid_request: only the payer or the person who added the expense can delete it",
			);
		}

		const contributors = await ctx.db
			.query("expenseContributors")
			.withIndex("by_expense", (q) => q.eq("expenseId", args.expenseId))
			.collect();

		for (const contributor of contributors) {
			await ctx.db.delete(contributor._id);
		}

		await ctx.db.delete(args.expenseId);
	},
});
