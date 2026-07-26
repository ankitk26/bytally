import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { deleteAllExpenseData as deleteAllExpenseDataHelper } from "./model/helpers";

const TEST_PASSWORD = "testpassword123";

const TEST_USER_NAMES = [
	"Alice",
	"Bob",
	"Charlie",
	"Diana",
	"Eve",
	"Frank",
	"Grace",
	"Henry",
];

function generateUniqueEmail(name: string): string {
	const timestamp = Date.now();
	const randomStr = Math.random().toString(36).substring(2, 8);
	return `${name.toLowerCase()}_${timestamp}_${randomStr}@test.com`;
}

export const createTestUser = mutation({
	args: {},
	handler: async (ctx) => {
		if (process.env.CONVEX_ENV !== "dev") {
			throw new Error("This mutation is only available in development mode");
		}

		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		const randomName =
			TEST_USER_NAMES[Math.floor(Math.random() * TEST_USER_NAMES.length)];
		const email = generateUniqueEmail(randomName);

		try {
			const result = await auth.api.signUpEmail({
				body: {
					email,
					password: TEST_PASSWORD,
					name: randomName,
				},
				headers,
			});

			return {
				success: true,
				email,
				password: TEST_PASSWORD,
				name: randomName,
				userId: result.user?.id,
			};
		} catch (error) {
			throw new Error(
				`Failed to create test user: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},
});

export const createTestUserWithEmail = mutation({
	args: {
		email: v.string(),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		if (process.env.CONVEX_ENV !== "dev") {
			throw new Error("This mutation is only available in development mode");
		}

		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		try {
			const result = await auth.api.signUpEmail({
				body: {
					email: args.email,
					password: TEST_PASSWORD,
					name: args.name,
				},
				headers,
			});

			return {
				success: true,
				email: args.email,
				password: TEST_PASSWORD,
				name: args.name,
				userId: result.user?.id,
			};
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.toLowerCase().includes("already exists")
			) {
				return {
					success: false,
					email: args.email,
					reason: "user already exists",
				};
			}

			throw new Error(
				`Failed to create test user: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},
});

export const deleteTestUser = mutation({
	args: {
		email: v.string(),
	},
	handler: async (ctx, args) => {
		if (process.env.CONVEX_ENV !== "dev") {
			throw new Error("This mutation is only available in development mode");
		}

		const normalizedEmail = args.email.trim().toLowerCase();

		// Delete our app-level user if it exists.
		const appUser = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
			.first();

		if (appUser) {
			await ctx.db.delete(appUser._id);
		}

		// Delete the better-auth user by email.
		const authUser = await ctx.runMutation(
			components.betterAuth.adapter.deleteOne,
			{
				input: {
					model: "user",
					where: [{ field: "email", value: normalizedEmail }],
				},
			},
		);

		const authUserId =
			authUser && typeof authUser === "object" && "id" in authUser
				? (authUser.id as string)
				: null;

		if (authUserId) {
			// Clean up sessions and accounts linked to the auth user.
			await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
				input: {
					model: "session",
					where: [{ field: "userId", value: authUserId }],
				},
				paginationOpts: { numItems: 100, cursor: null },
			});
			await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
				input: {
					model: "account",
					where: [{ field: "userId", value: authUserId }],
				},
				paginationOpts: { numItems: 100, cursor: null },
			});
		}

		return { deleted: true, email: normalizedEmail };
	},
});

export const listTestUsers = mutation({
	args: {},
	handler: async (ctx) => {
		if (process.env.CONVEX_ENV !== "dev") {
			throw new Error("This mutation is only available in development mode");
		}

		const users = await ctx.db.query("users").take(100);

		return users.map((user) => ({
			id: user._id,
			email: user.email,
			username: user.username,
			authId: user.authId,
			isPlaceholder: user.isPlaceholder,
		}));
	},
});

export const deleteAllExpenseData = mutation({
	args: {},
	handler: async (ctx) => {
		const result = await deleteAllExpenseDataHelper(ctx);
		return result;
	},
});
