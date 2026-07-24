import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export async function addMemberByEmail(
	ctx: MutationCtx,
	groupId: Id<"groups">,
	email: string,
): Promise<void> {
	const normalized = normalizeEmail(email);
	if (!normalized || !normalized.includes("@")) return;

	const existingUser = await ctx.db
		.query("users")
		.withIndex("by_email", (q) => q.eq("email", normalized))
		.first();

	if (existingUser) {
		const existingMember = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", groupId).eq("memberId", existingUser._id),
			)
			.first();

		if (!existingMember) {
			await ctx.db.insert("groupMembers", {
				groupId,
				memberId: existingUser._id,
			});
		}
		return;
	}

	const existingPending = await ctx.db
		.query("pendingGroupMembers")
		.withIndex("by_group_and_email", (q) =>
			q.eq("groupId", groupId).eq("email", normalized),
		)
		.first();

	if (!existingPending) {
		await ctx.db.insert("pendingGroupMembers", {
			groupId,
			email: normalized,
		});
	}
}
