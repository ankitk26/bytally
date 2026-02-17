import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

export const getSentRequests = query({
	handler: async (ctx) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const sentRequests = await ctx.db
			.query("requests")
			.withIndex("by_initiator", (q) => q.eq("initiatorId", authUser._id))
			.collect();

		const results: Array<{
			_id: Id<"requests">;
			receiver: { _id: Id<"users">; email: string };
			status: "pending" | "accepted" | "rejected";
			_creationTime: number;
		}> = [];

		for (const request of sentRequests) {
			const receiver = await ctx.db.get(request.receiverId);
			if (!receiver) continue;
			results.push({
				_id: request._id,
				receiver: {
					_id: receiver._id,
					email: receiver.email,
				},
				status: request.status,
				_creationTime: request._creationTime,
			});
		}

		return results;
	},
});

export const getReceivedRequests = query({
	handler: async (ctx) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const receivedRequests = await ctx.db
			.query("requests")
			.withIndex("by_receiver", (q) => q.eq("receiverId", authUser._id))
			.collect();

		const results: Array<{
			_id: Id<"requests">;
			initiator: { _id: Id<"users">; email: string };
			status: "pending" | "accepted" | "rejected";
			_creationTime: number;
		}> = [];

		for (const request of receivedRequests) {
			const initiator = await ctx.db.get(request.initiatorId);
			if (!initiator) continue;
			results.push({
				_id: request._id,
				initiator: {
					_id: initiator._id,
					email: initiator.email,
				},
				status: request.status,
				_creationTime: request._creationTime,
			});
		}

		return results;
	},
});

export const updateRequestStatus = mutation({
	args: {
		requestId: v.id("requests"),
		updatedStatus: v.union(
			v.literal("pending"),
			v.literal("accepted"),
			v.literal("rejected"),
		),
	},
	handler: async (ctx, args) => {
		const authUser = await getAuthUserIdOrThrow(ctx);

		const request = await ctx.db.get(args.requestId);
		if (!request) {
			throw new Error("invalid request");
		}

		if (request.receiverId !== authUser._id) {
			throw new Error("invalid request");
		}

		await ctx.db.patch(request._id, {
			status: args.updatedStatus,
			updatedTime: Date.now(),
		});
	},
});
