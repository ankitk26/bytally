import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { setAppTheme } from "~/lib/theme";
import { Button } from "./ui/button";

export default function ThemeToggler() {
	const { theme } = useRouteContext({ from: "__root__" });
	const router = useRouter();

	const toggleTheme = () => {
		setAppTheme({ data: theme === "dark" ? "light" : "dark" }).then(() =>
			router.invalidate(),
		);
	};

	return (
		<Button size="icon-sm" onClick={toggleTheme}>
			{theme === "dark" ? (
				<HugeiconsIcon icon={Sun01Icon} />
			) : (
				<HugeiconsIcon icon={Moon01Icon} />
			)}
		</Button>
	);
}
