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
		await ctx.db.insert("expenses", {
			groupId: args.groupId,
			paidBy: args.paidBy,
			updatedTime: Date.now(),
			expenseTime: args.expenseTime,
			title: args.title.trim(),
			description: args.description?.trim(),
			amount: args.amount,
		});
	},
});
