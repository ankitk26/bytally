import {
	UserIcon,
	InboxIcon,
	Logout01Icon,
	UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouteContext, Link } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";
import ThemeToggler from "./theme-toggler";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
	const { auth } = useRouteContext({ from: "/_protected" });

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					location.reload();
				},
			},
		});
	};

	return (
		<header className="border-border border-b">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:h-12 lg:px-6">
				<Link
					to="/"
					className="text-foreground font-serif text-base italic transition-opacity hover:opacity-80"
				>
					bytally
				</Link>
				<div className="flex items-center gap-2">
					<ThemeToggler />
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button type="button" size="icon-sm" variant="outline">
									<HugeiconsIcon
										icon={UserIcon}
										className="h-3.5 w-3.5"
										strokeWidth={2}
									/>
								</Button>
							}
						/>
						<DropdownMenuContent align="end" className="w-48">
							<div className="px-2 py-2">
								<div className="text-foreground truncate text-xs font-medium">
									{auth.username}
								</div>
								<div className="text-muted-foreground truncate text-xs">
									{auth.email}
								</div>
							</div>
							<DropdownMenuSeparator />
							<Link to="/profile" className="block">
								<DropdownMenuItem className="cursor-pointer">
									<HugeiconsIcon
										icon={UserEdit01Icon}
										className="h-3.5 w-3.5"
										strokeWidth={2}
									/>
									Profile
								</DropdownMenuItem>
							</Link>
							<Link to="/requests" className="block">
								<DropdownMenuItem className="cursor-pointer">
									<HugeiconsIcon
										icon={InboxIcon}
										className="h-3.5 w-3.5"
										strokeWidth={2}
									/>
									Requests
								</DropdownMenuItem>
							</Link>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onClick={handleSignOut}
								className="cursor-pointer"
							>
								<HugeiconsIcon
									icon={Logout01Icon}
									className="h-3.5 w-3.5"
									strokeWidth={2}
								/>
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
