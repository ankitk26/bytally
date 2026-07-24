import { SignOutIcon, UserIcon } from "@phosphor-icons/react";
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
					className="text-foreground font-serif text-base transition-opacity hover:opacity-80"
				>
					bytally
				</Link>
				<div className="flex items-center gap-2">
					<ThemeToggler />
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button type="button" size="icon-sm" variant="outline">
									<UserIcon />
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
									<UserIcon />
									Profile
								</DropdownMenuItem>
							</Link>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onClick={handleSignOut}
								className="cursor-pointer"
							>
								<SignOutIcon />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
