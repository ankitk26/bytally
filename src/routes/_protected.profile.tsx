import { useConvexMutation } from "@convex-dev/react-query";
import { CheckCircleIcon, SpinnerIcon, UserIcon } from "@phosphor-icons/react";
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
	const [upiId, setUpiId] = useState(auth.upiId || "");
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

		mutate({ username: trimmedUsername, upiId: upiId.trim() });
	};

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
				<h1 className="mb-4 font-serif text-xl text-foreground lg:mb-6 lg:pb-4 lg:text-2xl">
					Profile
				</h1>

				<div className="lg:max-w-lg">
					<div className="border-border py-5 lg:border lg:px-5">
						<div className="mb-6 flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground">
								<UserIcon />
							</div>
							<div>
								<p className="text-xs tracking-wider text-muted-foreground uppercase">
									Account
								</p>
								<p className="truncate font-serif text-base text-foreground">
									{auth.email}
								</p>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1.5">
								<Label
									htmlFor="username"
									className="text-xs text-muted-foreground"
								>
									Username
								</Label>
								<Input
									id="username"
									type="text"
									value={username}
									onChange={(e) => {
										setUsername(e.target.value);
										setIsSaved(false);
									}}
									placeholder="Enter your username"
									required
								/>
							</div>

							<div className="space-y-1.5">
								<Label
									htmlFor="upi-id"
									className="text-xs text-muted-foreground"
								>
									UPI ID
								</Label>
								<Input
									id="upi-id"
									type="text"
									value={upiId}
									onChange={(e) => {
										setUpiId(e.target.value);
										setIsSaved(false);
									}}
									placeholder="yourname@bank"
									autoComplete="off"
								/>
								<p className="text-xs text-muted-foreground">
									Used when someone needs to pay you back.
								</p>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs text-muted-foreground">Email</Label>
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
									isPending ||
									!username?.trim() ||
									(username === auth.username &&
										upiId.trim() === (auth.upiId || ""))
								}
								className="w-full"
							>
								{isPending ? (
									<SpinnerIcon className="animate-spin" />
								) : isSaved ? (
									<>
										<CheckCircleIcon />
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
