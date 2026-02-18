import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		email: v.string(),
		authId: v.string(),
		username: v.string(),
		updatedTime: v.number(),
	})
		.index("by_auth", ["authId"])
		.index("by_email", ["email"]),

	groups: defineTable({
		adminId: v.id("users"),
		name: v.string(),
		description: v.optional(v.string()),
		updatedTime: v.number(),
		coverImageUrl: v.string(),
	}).index("by_admin", ["adminId"]),

	groupMembers: defineTable({
		memberId: v.id("users"),
		groupId: v.id("groups"),
	})
		.index("by_group_and_member", ["groupId", "memberId"])
		.index("by_member", ["memberId"]),

	requests: defineTable({
		initiatorId: v.id("users"),
		receiverId: v.id("users"),
		status: v.union(
			v.literal("pending"),
			v.literal("accepted"),
			v.literal("rejected"),
		),
		updatedTime: v.number(),
	})
		.index("by_initiator", ["initiatorId"])
		.index("by_receiver", ["receiverId"]),

	friends: defineTable({
		userId1: v.id("users"),
		userId2: v.id("users"),
	})
		.index("by_user", ["userId1", "userId2"])
		.index("by_user1", ["userId1"])
		.index("by_user2", ["userId2"]),

	expenses: defineTable({
		groupId: v.id("groups"),
		paidBy: v.id("users"),
		updatedTime: v.number(),
		expenseTime: v.number(),
		title: v.string(),
		description: v.optional(v.string()),
		amount: v.number(),
		splitMode: v.union(v.literal("equal"), v.literal("manual")),
	})
		.index("by_group", ["groupId"])
		.index("by_group_and_expense_time", ["groupId", "expenseTime"]),

	expenseContributors: defineTable({
		expenseId: v.id("expenses"),
		contributorId: v.id("users"),
		amount: v.number(),
		isSettled: v.boolean(),
		updatedTime: v.number(),
	})
		.index("by_expense", ["expenseId"])
		.index("by_expense_and_contributor", ["expenseId", "contributorId"]),
});
