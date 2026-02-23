import { useConvexMutation } from "@convex-dev/react-query";
import {
	CheckmarkCircle01Icon,
	Loading03Icon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	useRouteContext,
	useRouter,
} from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authUserQuery } from "~/queries/auth-user-query";

export const Route = createFileRoute("/_protected/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const { auth, queryClient } = useRouteContext({ from: "/_protected" });

	const [username, setUsername] = useState(auth.username || "");
	const [isSaved, setIsSaved] = useState(false);
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: useConvexMutation(api.users.update),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: authUserQuery.queryKey,
			});
			await router.invalidate();
			setIsSaved(true);
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
			<main className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
				<h1 className="text-foreground mb-4 font-serif text-xl lg:mb-6 lg:pb-4 lg:text-2xl">
					Profile
				</h1>

				<div className="lg:max-w-lg">
					<div className="border-border py-5 lg:border lg:px-5">
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
								<p className="text-foreground truncate font-serif text-base">
									{auth.email}
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
									value={auth.email}
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
