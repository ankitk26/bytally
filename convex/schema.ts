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

	pendingGroupMembers: defineTable({
		groupId: v.id("groups"),
		email: v.string(),
	})
		.index("by_group", ["groupId"])
		.index("by_email", ["email"])
		.index("by_group_and_email", ["groupId", "email"]),

	expenses: defineTable({
		groupId: v.id("groups"),
		paidBy: v.id("users"),
		addedBy: v.id("users"),
		updatedTime: v.number(),
		expenseTime: v.number(),
		title: v.string(),
		description: v.optional(v.string()),
		amount: v.number(),
		splitMode: v.union(v.literal("equal"), v.literal("manual")),
	}).index("by_group", ["groupId"]),
	expenseContributors: defineTable({
		groupId: v.id("groups"),
		payerId: v.id("users"),
		expenseId: v.id("expenses"),
		contributorId: v.id("users"),
		amount: v.number(),
		isSettled: v.boolean(),
		updatedTime: v.number(),
	})
		.index("by_expense", ["expenseId"])
		.index("by_group_and_payer_and_contributor", [
			"groupId",
			"payerId",
			"contributorId",
			"isSettled",
		])
		.index("by_group_and_contributor", [
			"groupId",
			"contributorId",
			"isSettled",
		]),
});
