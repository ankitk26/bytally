import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	UserIcon,
	CheckmarkCircle01Icon,
	Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const Route = createFileRoute("/_protected/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const { auth } = useRouteContext({ from: "/_protected" });
	const [username, setUsername] = useState(auth.username || "");
	const [isSaved, setIsSaved] = useState(false);

	const { data: user } = useQuery(convexQuery(api.auth.getCurrentUser));

	const { mutate, isPending } = useMutation({
		mutationFn: useConvexMutation(api.users.update),
		onSuccess: () => {
			setIsSaved(true);
			setTimeout(() => setIsSaved(false), 2000);
		},
	});

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const trimmedUsername = username?.trim();
		if (!trimmedUsername) return;

		mutate({ username: trimmedUsername });
	};

	return (
		<div className="bg-background min-h-screen">
			<main className="mx-auto max-w-6xl px-6 py-8">
				<div className="mb-6 flex items-end justify-between pb-4">
					<div>
						<h1 className="text-foreground font-serif text-3xl">Profile</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Manage your account settings
						</p>
					</div>
				</div>

				<div className="max-w-lg">
					<div className="border-border border p-5">
						<div className="mb-6 flex items-center gap-3">
							<div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center">
								<HugeiconsIcon
									icon={UserIcon}
									className="h-6 w-6"
									strokeWidth={2}
								/>
							</div>
							<div>
								<p className="text-muted-foreground text-xs tracking-wider uppercase">
									Account
								</p>
								<p className="text-foreground font-serif text-base">
									{user?.email || auth.email}
								</p>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1.5">
								<Label
									htmlFor="username"
									className="text-muted-foreground text-xs"
								>
									Username
								</Label>
								<Input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Enter your username"
									required
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-muted-foreground text-xs">Email</Label>
								<Input
									type="email"
									value={user?.email || auth.email}
									disabled
									className="bg-muted/50"
								/>
							</div>

							<Button
								type="submit"
								disabled={
									isPending || !username?.trim() || username === auth.username
								}
								className="w-full"
							>
								{isPending ? (
									<HugeiconsIcon
										icon={Loading03Icon}
										className="h-3.5 w-3.5 animate-spin"
										strokeWidth={2}
									/>
								) : isSaved ? (
									<>
										<HugeiconsIcon
											icon={CheckmarkCircle01Icon}
											className="h-3.5 w-3.5"
											strokeWidth={2}
										/>
										Saved
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
}
