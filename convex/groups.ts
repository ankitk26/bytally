import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

export const getById = query({
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

		const admin = await ctx.db.get("users", group.adminId);

		return { ...group, admin };
	},
});

export const getAllGroups = query({
	handler: async (ctx) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const groupsWhereUserIsAdmin = await ctx.db
			.query("groups")
			.withIndex("by_admin", (q) => q.eq("adminId", authUser._id))
			.collect();
		const groupIdsWhereUserIsMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_member", (q) => q.eq("memberId", authUser._id))
			.collect();

		const groupsWhereUserIsMember = await Promise.all(
			groupIdsWhereUserIsMember.map((group) => ctx.db.get(group.groupId)),
		);

		// Combine both lists and filter out duplicates
		const allGroups = [
			...groupsWhereUserIsAdmin,
			...groupsWhereUserIsMember.filter(
				(g): g is NonNullable<typeof g> => g !== null,
			),
		];

		const uniqueGroups = Array.from(
			new Map(allGroups.map((g) => [g._id, g])).values(),
		);

		return uniqueGroups;
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		// TODO: allow to pass adminId
		// adminId: v.optional(v.id("users"))
		groupMembers: v.array(v.id("users")),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const newGroupId = await ctx.db.insert("groups", {
			adminId: authUser._id,
			coverImageUrl: "",
			name: args.name,
			updatedTime: Date.now(),
			description: args.description,
		});

		for (const memberId of args.groupMembers) {
			await ctx.db.insert("groupMembers", {
				groupId: newGroupId,
				memberId,
			});
		}

		// add admin also as a member
		await ctx.db.insert("groupMembers", {
			groupId: newGroupId,
			memberId: authUser._id,
		});
	},
});
