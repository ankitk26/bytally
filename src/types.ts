import type { Id } from "convex/_generated/dataModel";

export type AppTheme = "dark" | "light";

export type GroupMember = {
	memberId: Id<"users">;
	username: string;
};
