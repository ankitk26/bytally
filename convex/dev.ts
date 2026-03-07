import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

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
		}));
	},
});

export const acceptRequest = internalMutation({
	args: {
		requestId: v.id("requests"),
	},
	handler: async (ctx, args) => {
		const request = await ctx.db.get(args.requestId);
		if (!request) {
			throw new Error("Request not found");
		}

		if (request.status !== "pending") {
			throw new Error("Request is not pending");
		}

		await ctx.db.patch(request._id, {
			status: "accepted",
			updatedTime: Date.now(),
		});

		const [userId1, userId2] =
			request.initiatorId < request.receiverId
				? [request.initiatorId, request.receiverId]
				: [request.receiverId, request.initiatorId];

		const alreadyFriends = await ctx.db
			.query("friends")
			.withIndex("by_user", (q) =>
				q.eq("userId1", userId1).eq("userId2", userId2),
			)
			.first();

		if (!alreadyFriends) {
			await ctx.db.insert("friends", { userId1, userId2 });
		}

		return { success: true };
	},
});
