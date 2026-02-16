import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		email: v.string(),
		authId: v.string(),
		username: v.string(),
		updatedTime: v.number(),
	}).index("by_auth", ["authId"]),
});
