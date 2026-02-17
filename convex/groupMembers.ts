import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
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
			_id: Id<"users">;
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
				_id: memberUser._id,
				email: memberUser.email,
				isAdmin: group.adminId === member.memberId,
			});
		}

		return finalGroupMembers;
	},
});
