import { useConvexMutation } from "@convex-dev/react-query";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function SendRequestForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);

	const sendRequestMutation = useMutation({
		mutationFn: useConvexMutation(api.requests.createRequest),
		onSuccess: () => {
			setEmail("");
			setError(null);
		},
		onError: (e) => {
			if (e.message.includes("user_not_found")) {
				setError("User not found");
			} else {
				setError("Failed to send request");
			}
		},
	});

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		if (email.trim()) {
			sendRequestMutation.mutate({ receiverEmail: email.trim() });
		}
	};

	return (
		<div className="space-y-2">
			<form onSubmit={handleSubmit} className="flex gap-2">
				<Input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter email address"
					required
				/>
				<Button
					type="submit"
					disabled={sendRequestMutation.isPending || email.trim() === ""}
				>
					{sendRequestMutation.isPending ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							className="h-4 w-4 animate-spin"
							strokeWidth={2}
						/>
					) : (
						"Send Request"
					)}
				</Button>
			</form>
			{error && <p className="text-destructive text-xs">{error}</p>}
		</div>
	);
}
