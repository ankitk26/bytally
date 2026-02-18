import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

// Helper type for contribution processing
type Contribution = { memberId: string; amount: number };

function processContributions(
	contributions: Contribution[],
	amount: number,
	splitMode: "equal" | "manual",
): Contribution[] {
	if (splitMode === "equal" && contributions.length > 0) {
		const count = contributions.length;
		const baseShare = Math.floor((amount / count) * 100) / 100;

		// All except last get base share
		const roundedShares = contributions.slice(0, -1).map((c) => ({
			memberId: c.memberId,
			amount: baseShare,
		}));

		// Last contributor gets remainder-adjusted amount
		const sumOfOthers = baseShare * (count - 1);
		const lastContributor = contributions[count - 1];
		roundedShares.push({
			memberId: lastContributor.memberId,
			amount: Math.round((amount - sumOfOthers) * 100) / 100,
		});

		return roundedShares;
	}

	// Manual mode: just round to 2 decimals
	return contributions.map((c) => ({
		memberId: c.memberId,
		amount: Math.round(c.amount * 100) / 100,
	}));
}

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

		// Fetch payer details and contributions for each expense
		const expensesWithDetails = await Promise.all(
			expenses.map(async (expense) => {
				const payer = await ctx.db.get(expense.paidBy);

				const contributors = await ctx.db
					.query("expenseContributors")
					.withIndex("by_expense", (q) => q.eq("expenseId", expense._id))
					.collect();

				const contributorsWithDetails = await Promise.all(
					contributors.map(async (c) => {
						const user = await ctx.db.get(c.contributorId);
						return {
							contributorId: c.contributorId,
							amount: c.amount,
							username: user?.username ?? "Unknown",
						};
					}),
				);

				return {
					...expense,
					paidByUsername: payer?.username ?? "Unknown",
					canEdit:
						expense.paidBy === authUser._id || expense.addedBy === authUser._id,
					contributors: contributorsWithDetails,
				};
			}),
		);

		return expensesWithDetails;
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
		const processedContributions = processContributions(
			args.contributions,
			args.amount,
			args.splitMode,
		);

		for (const contribution of processedContributions) {
			await ctx.db.insert("expenseContributors", {
				groupId: args.groupId,
				expenseId,
				contributorId: contribution.memberId as typeof args.paidBy,
				amount: contribution.amount,
				isSettled: false,
				updatedTime: Date.now(),
				payerId: args.paidBy,
			});
		}
	},
});

export const update = mutation({
	args: {
		expenseId: v.id("expenses"),
		paidBy: v.id("users"),
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

		const expense = await ctx.db.get(args.expenseId);
		if (!expense) {
			throw new ConvexError("invalid_request: expense not found");
		}

		if (expense.paidBy !== authUser._id && expense.addedBy !== authUser._id) {
			throw new ConvexError(
				"invalid_request: only the payer or the person who added the expense can edit it",
			);
		}

		// Validate amount is positive
		if (args.amount <= 0) {
			throw new ConvexError("invalid_request: amount must be positive");
		}

		// Validate title is not empty
		if (!args.title.trim()) {
			throw new ConvexError("invalid_request: title is required");
		}

		// Check if paidBy user is a member of the group
		const isPaidByMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", expense.groupId).eq("memberId", args.paidBy),
			)
			.first();

		if (!isPaidByMember) {
			throw new ConvexError(
				"invalid_request: paidBy user is not a group member",
			);
		}

		// Delete old contributions
		const oldContributors = await ctx.db
			.query("expenseContributors")
			.withIndex("by_expense", (q) => q.eq("expenseId", args.expenseId))
			.collect();

		for (const contributor of oldContributors) {
			await ctx.db.delete(contributor._id);
		}

		// Update the expense
		await ctx.db.patch(args.expenseId, {
			paidBy: args.paidBy,
			updatedTime: Date.now(),
			title: args.title.trim(),
			description: args.description?.trim(),
			amount: args.amount,
			splitMode: args.splitMode,
		});

		// Process contributions with rounding
		const processedContributions = processContributions(
			args.contributions,
			args.amount,
			args.splitMode,
		);

		for (const contribution of processedContributions) {
			await ctx.db.insert("expenseContributors", {
				groupId: expense.groupId,
				expenseId: args.expenseId,
				contributorId: contribution.memberId as typeof args.paidBy,
				amount: contribution.amount,
				isSettled: false,
				updatedTime: Date.now(),
				payerId: args.paidBy,
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
