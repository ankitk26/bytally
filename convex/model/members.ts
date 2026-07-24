import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

async function createPlaceholderUser(
	ctx: MutationCtx,
	email: string,
): Promise<Id<"users">> {
	return await ctx.db.insert("users", {
		authId: `placeholder:${email}:${Date.now()}`,
		email,
		username: email,
		updatedTime: Date.now(),
		isPlaceholder: true,
	});
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

	const userId = existingUser
		? existingUser._id
		: await createPlaceholderUser(ctx, normalized);

	const existingMember = await ctx.db
		.query("groupMembers")
		.withIndex("by_group_and_member", (q) =>
			q.eq("groupId", groupId).eq("memberId", userId),
		)
		.first();

	if (!existingMember) {
		await ctx.db.insert("groupMembers", {
			groupId,
			memberId: userId,
		});
	}
}

export async function removePlaceholderUserIfNoGroups(
	ctx: MutationCtx,
	userId: Id<"users">,
): Promise<void> {
	const user = await ctx.db.get(userId);
	if (!user?.isPlaceholder) return;

	const remainingMemberships = await ctx.db
		.query("groupMembers")
		.withIndex("by_member", (q) => q.eq("memberId", userId))
		.first();

	if (!remainingMemberships) {
		await ctx.db.delete(userId);
	}
}
