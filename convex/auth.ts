import type { AuthFunctions, GenericCtx } from "@convex-dev/better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
	authFunctions,
	triggers: {
		user: {
			onCreate: async (ctx, doc) => {
				await ctx.db.insert("users", {
					authId: doc._id,
					email: doc.email,
					username: doc.email.split("@")[0],
					updatedTime: Date.now(),
				});
			},
			onUpdate: async (ctx, newDoc) => {
				const user = await ctx.db
					.query("users")
					.withIndex("by_auth", (q) => q.eq("authId", newDoc._id))
					.first();
				if (!user) {
					throw new Error("Invalid request");
				}

				await ctx.db.patch(user._id, {
					email: newDoc.email,
					updatedTime: Date.now(),
				});
			},
		},
	},
});

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth({
		baseURL: siteUrl,
		database: authComponent.adapter(ctx),
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			},
		},
		plugins: [
			// The Convex plugin is required for Convex compatibility
			convex({ authConfig }),
		],
	});
};

export const getCurrentUser = query({
	handler: async (ctx) => {
		const authUser = await authComponent.getAuthUser(ctx);
		if (!authUser) {
			return null;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_auth", (q) => q.eq("authId", authUser._id))
			.first();

		return {
			email: authUser.email,
			username: user?.username,
			authUserId: user?._id,
		};
	},
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
