import { queryOptions } from "@tanstack/react-query";
import { getAuthUser } from "~/server-fns/get-auth";

export const authUserQuery = queryOptions({
	queryKey: ["auth_user"],
	queryFn: async () => await getAuthUser(),
	staleTime: 10 * 60 * 1000,
});
