/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as dev from "../dev.js";
import type * as expenseContributors from "../expenseContributors.js";
import type * as expenses from "../expenses.js";
import type * as groupMembers from "../groupMembers.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as model_helpers from "../model/helpers.js";
import type * as model_members from "../model/members.js";
import type * as model_settlements from "../model/settlements.js";
import type * as model_users from "../model/users.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  dev: typeof dev;
  expenseContributors: typeof expenseContributors;
  expenses: typeof expenses;
  groupMembers: typeof groupMembers;
  groups: typeof groups;
  http: typeof http;
  "model/helpers": typeof model_helpers;
  "model/members": typeof model_members;
  "model/settlements": typeof model_settlements;
  "model/users": typeof model_users;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
