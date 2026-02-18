import { UserIcon, InboxIcon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouteContext, Link } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";
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
			<div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
				<Link
					to="/"
					className="text-foreground font-serif text-base italic transition-opacity hover:opacity-80"
				>
					bitally
				</Link>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<button
								type="button"
								aria-label="User menu"
								className="hover:bg-muted focus-visible:ring-ring/50 flex h-8 w-8 items-center justify-center rounded-none transition-colors outline-none focus-visible:ring-1"
							>
								<div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center">
									<HugeiconsIcon
										icon={UserIcon}
										className="h-3.5 w-3.5"
										strokeWidth={2}
									/>
								</div>
							</button>
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
		</header>
	);
}
