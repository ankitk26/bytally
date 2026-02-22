import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { AppTheme } from "~/types";

const appThemeKey = "app-theme";

export const getAppTheme = createServerFn().handler((): AppTheme => {
	return (getCookie(appThemeKey) as AppTheme) ?? "dark";
});

export const setAppTheme = createServerFn()
	.inputValidator((data: AppTheme) => data)
	.handler(({ data }) => {
		setCookie(appThemeKey, data);
	});
