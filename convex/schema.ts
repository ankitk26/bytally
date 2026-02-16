import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		email: v.string(),
		authId: v.string(),
		username: v.string(),
		updatedTime: v.number(),
	}).index("by_auth", ["authId"]),

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
	}).index("by_member", ["memberId"]),
});
