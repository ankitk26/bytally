import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getGroupLedgerBalances, simplifyBalances } from "./model/settlements";
import { getAuthUserIdOrThrow } from "./model/users";

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
		const balances = await getGroupLedgerBalances(ctx, args.groupId, memberIds);

		return simplifyBalances(balances);
	},
});

export const settleSimplifiedDebt = mutation({
	args: {
		groupId: v.id("groups"),
		fromUserId: v.id("users"),
		toUserId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		if (args.fromUserId === args.toUserId) {
			throw new Error("invalid_request");
		}

		// Verify the caller is either the sender or receiver
		if (authUser._id !== args.fromUserId && authUser._id !== args.toUserId) {
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

		const allGroupMembers = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) => q.eq("groupId", args.groupId))
			.collect();

		const memberIds = allGroupMembers.map((m) => m.memberId);

		// Derive the amount server-side from the current simplified debt graph
		// so stale or malicious clients cannot settle wrong amounts.
		const balances = await getGroupLedgerBalances(ctx, args.groupId, memberIds);
		const transactions = simplifyBalances(balances);

		const transaction = transactions.find(
			(t) => t.fromUserId === args.fromUserId && t.toUserId === args.toUserId,
		);

		// Debt no longer exists (already settled) — idempotent no-op
		if (!transaction) {
			return;
		}

		// Record the money moved as an offset against the expense ledger.
		// Contribution rows are never mutated, so expense edits and future
		// settles always see a consistent ledger.
		await ctx.db.insert("settlements", {
			groupId: args.groupId,
			fromUserId: args.fromUserId,
			toUserId: args.toUserId,
			amount: transaction.amount,
			createdBy: authUser._id,
			createdTime: Date.now(),
			type: "simplified",
		});
	},
});

export const undoSettlement = mutation({
	args: {
		settlementId: v.id("settlements"),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const settlement = await ctx.db.get(args.settlementId);
		if (!settlement) {
			throw new Error("invalid_request");
		}

		const isGroupMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", settlement.groupId).eq("memberId", authUser._id),
			)
			.first();

		if (!isGroupMember) {
			throw new Error("invalid_request");
		}

		const isInvolved =
			settlement.fromUserId === authUser._id ||
			settlement.toUserId === authUser._id ||
			settlement.createdBy === authUser._id;

		if (!isInvolved) {
			throw new Error("invalid_request");
		}

		// The settlement is a pure ledger offset — deleting it restores the
		// underlying debts exactly.
		await ctx.db.delete(args.settlementId);
	},
});
