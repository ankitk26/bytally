import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { addMemberByEmail, normalizeEmail } from "./model/members";
import { getAuthUserIdOrThrow } from "./model/users";

export const getMembersByGroup = query({
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

		const finalGroupMembers: Array<{
			memberId: Id<"users">;
			username: string;
			email: string;
			isAdmin: boolean;
		}> = [];

		const groupMembers = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) => q.eq("groupId", args.groupId))
			.collect();

		for (const member of groupMembers) {
			const memberUser = await ctx.db.get("users", member.memberId);
			if (!memberUser) {
				continue;
			}
			finalGroupMembers.push({
				memberId: memberUser._id,
				username: memberUser.username,
				email: memberUser.email,
				isAdmin: group.adminId === member.memberId,
			});
		}

		return finalGroupMembers;
	},
});

export const getPendingInvitesByGroup = query({
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

		const pending = await ctx.db
			.query("pendingGroupMembers")
			.withIndex("by_group", (q) => q.eq("groupId", args.groupId))
			.collect();

		return pending.map((p) => ({ _id: p._id, email: p.email }));
	},
});

export const addMembersByEmail = mutation({
	args: {
		groupId: v.id("groups"),
		emails: v.array(v.string()),
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

		const seenEmails = new Set<string>();

		for (const rawEmail of args.emails) {
			const email = normalizeEmail(rawEmail);
			if (!email || seenEmails.has(email)) continue;
			seenEmails.add(email);
			await addMemberByEmail(ctx, args.groupId, email);
		}
	},
});

export const removeMemberFromGroup = mutation({
	args: {
		memberIds: v.array(v.id("users")),
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

		for (const memberId of args.memberIds) {
			// Find and delete the group member record
			const memberRecord = await ctx.db
				.query("groupMembers")
				.withIndex("by_group_and_member", (q) =>
					q.eq("groupId", args.groupId).eq("memberId", memberId),
				)
				.first();

			if (memberRecord) {
				await ctx.db.delete(memberRecord._id);
			}
		}
	},
});

export const cancelPendingInvite = mutation({
	args: {
		pendingMemberId: v.id("pendingGroupMembers"),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const pending = await ctx.db.get(args.pendingMemberId);
		if (!pending) {
			throw new Error("invalid_request");
		}

		const group = await ctx.db.get(pending.groupId);
		if (!group) {
			throw new Error("invalid_request");
		}

		const isGroupMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", pending.groupId).eq("memberId", authUser._id),
			)
			.first();

		if (!isGroupMember) {
			throw new Error("invalid_request");
		}

		await ctx.db.delete(args.pendingMemberId);
	},
});
