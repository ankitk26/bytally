import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
	addMemberByEmail,
	removePlaceholderUserIfNoGroups,
	normalizeEmail,
} from "./model/members";
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
			isPlaceholder: boolean;
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
				isPlaceholder: memberUser.isPlaceholder ?? false,
			});
		}

		return finalGroupMembers;
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
		groupId: v.id("groups"),
		memberId: v.id("users"),
		confirm: v.boolean(),
		newPayerId: v.optional(v.id("users")),
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

		const targetMemberRecord = await ctx.db
			.query("groupMembers")
			.withIndex("by_group_and_member", (q) =>
				q.eq("groupId", args.groupId).eq("memberId", args.memberId),
			)
			.first();

		if (!targetMemberRecord) {
			throw new Error("invalid_request");
		}

		if (group.adminId === args.memberId) {
			throw new Error("cannot_remove_admin");
		}

		const memberUser = await ctx.db.get(args.memberId);
		const memberName = memberUser?.username ?? "Unknown";

		const payerExpenses: Array<{ expenseId: Id<"expenses">; title: string }> =
			[];
		const blockedExpenses: Array<{
			expenseId: Id<"expenses">;
			title: string;
			amount: number;
		}> = [];
		const unsettledContributions: Array<{
			expenseId: Id<"expenses">;
			title: string;
			amount: number;
			otherContributorIds: Id<"users">[];
		}> = [];

		const expenses = await ctx.db
			.query("expenses")
			.withIndex("by_group", (q) => q.eq("groupId", args.groupId))
			.collect();

		for (const expense of expenses) {
			const contributors = await ctx.db
				.query("expenseContributors")
				.withIndex("by_expense", (q) => q.eq("expenseId", expense._id))
				.collect();

			if (expense.paidBy === args.memberId) {
				payerExpenses.push({
					expenseId: expense._id,
					title: expense.title,
				});
			}

			const memberContribution = contributors.find(
				(c) => c.contributorId === args.memberId && !c.isSettled,
			);

			if (memberContribution) {
				const otherContributors = contributors.filter(
					(c) => c.contributorId !== args.memberId,
				);

				if (otherContributors.length === 0) {
					blockedExpenses.push({
						expenseId: expense._id,
						title: expense.title,
						amount: memberContribution.amount,
					});
				} else {
					unsettledContributions.push({
						expenseId: expense._id,
						title: expense.title,
						amount: memberContribution.amount,
						otherContributorIds: otherContributors.map((c) => c.contributorId),
					});
				}
			}
		}

		const hasIssues =
			payerExpenses.length > 0 ||
			blockedExpenses.length > 0 ||
			unsettledContributions.length > 0;

		if (!args.confirm && hasIssues) {
			return {
				needsConfirmation: true,
				memberName,
				payerExpenses,
				blockedExpenses,
				unsettledContributions,
			};
		}

		if (hasIssues) {
			if (blockedExpenses.length > 0) {
				throw new Error("cannot_remove_only_contributor");
			}
			if (payerExpenses.length > 0) {
				if (!args.newPayerId) {
					throw new Error("new_payer_required");
				}
				if (args.newPayerId === args.memberId) {
					throw new Error("new_payer_cannot_be_removed_member");
				}
			}
		}

		const dateStr = new Date().toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});

		for (const expense of expenses) {
			const contributors = await ctx.db
				.query("expenseContributors")
				.withIndex("by_expense", (q) => q.eq("expenseId", expense._id))
				.collect();

			let payerLog = "";
			let redistributionLog = "";

			// Handle expenses where the removed member is the payer
			if (expense.paidBy === args.memberId) {
				const newPayerId = args.newPayerId as Id<"users">;

				const newPayerMember = await ctx.db
					.query("groupMembers")
					.withIndex("by_group_and_member", (q) =>
						q.eq("groupId", args.groupId).eq("memberId", newPayerId),
					)
					.first();

				if (!newPayerMember) {
					throw new Error("invalid_request: new payer is not a group member");
				}

				const newPayerUser = await ctx.db.get(newPayerId);
				const newPayerName = newPayerUser?.username ?? "Unknown";

				await ctx.db.patch(expense._id, {
					paidBy: newPayerId,
					updatedTime: Date.now(),
				});

				for (const contributor of contributors) {
					await ctx.db.patch(contributor._id, {
						payerId: newPayerId,
						updatedTime: Date.now(),
					});
				}

				payerLog = `When ${memberName} was removed, ${newPayerName} became the payer for this expense.`;
			}

			// Handle unsettled contributions by the removed member
			const memberContribution = contributors.find(
				(c) => c.contributorId === args.memberId && !c.isSettled,
			);

			if (memberContribution) {
				const otherContributors = contributors.filter(
					(c) => c.contributorId !== args.memberId,
				);

				if (otherContributors.length === 0) {
					throw new Error("cannot_remove_only_contributor");
				}

				const amountToDistribute = memberContribution.amount;
				const count = otherContributors.length;
				const baseShare = Math.floor((amountToDistribute / count) * 100) / 100;
				const sumOfOthers = baseShare * (count - 1);
				const lastShare =
					Math.round((amountToDistribute - sumOfOthers) * 100) / 100;

				const otherContributorNames: string[] = [];

				for (let i = 0; i < otherContributors.length; i++) {
					const contributor = otherContributors[i];
					const additionalAmount = i === count - 1 ? lastShare : baseShare;
					const newAmount =
						Math.round((contributor.amount + additionalAmount) * 100) / 100;

					await ctx.db.patch(contributor._id, {
						amount: newAmount,
						updatedTime: Date.now(),
					});

					const user = await ctx.db.get(contributor.contributorId);
					otherContributorNames.push(
						`${user?.username ?? "Unknown"} (${additionalAmount.toFixed(2)})`,
					);
				}

				await ctx.db.delete(memberContribution._id);

				await ctx.db.patch(expense._id, {
					splitMode: "manual",
					updatedTime: Date.now(),
				});

				redistributionLog = `When ${memberName} was removed, their unpaid $${amountToDistribute.toFixed(2)} share was split equally among ${otherContributorNames.join(", ")}.`;
			}

			// Append logs to the expense description
			const logs = [payerLog, redistributionLog].filter(Boolean);
			if (logs.length > 0) {
				const entry = `[${dateStr}] ${logs.join(" ")}`;
				const newDescription = expense.description
					? `${expense.description}\n${entry}`
					: entry;

				await ctx.db.patch(expense._id, {
					description: newDescription,
				});
			}
		}

		await ctx.db.delete(targetMemberRecord._id);
		await removePlaceholderUserIfNoGroups(ctx, args.memberId);

		return { success: true };
	},
});
