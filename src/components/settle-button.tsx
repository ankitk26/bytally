import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { formatCurrency } from "~/lib/format-currency";

type Props = {
	groupId: Id<"groups">;
	memberId: Id<"users">;
	amountOwed: number;
	receiverName: string;
};

export default function SettleButton({
	groupId,
	memberId,
	amountOwed,
	receiverName,
}: Props) {
	const { auth } = useRouteContext({ from: "/_protected" });
	const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false);
	const [settlementMode, setSettlementMode] = useState<
		"upi" | "later" | "confirm" | null
	>(null);
	const [isAwaitingPaymentReturn, setIsAwaitingPaymentReturn] = useState(false);
	const hasGoneHiddenRef = useRef(false);

	const checkUpiMutation = useMutation({
		mutationFn: useConvexMutation(
			api.expenseContributors.getSettlementPaymentUrl,
		),
	});

	const settleMutation = useMutation({
		mutationFn: useConvexMutation(api.expenseContributors.settleSimplifiedDebt),
	});

	const currentUserId = auth.authUserId;
	const iOweThem = amountOwed < 0;

	const recordSettlement = () => {
		settleMutation.mutate(
			{
				groupId,
				fromUserId: currentUserId!,
				toUserId: memberId,
			},
			{
				onSuccess: () => undefined,
			},
		);
	};

	const handleSettle = () => {
		checkUpiMutation.mutate(
			{
				groupId,
				fromUserId: currentUserId!,
				toUserId: memberId,
			},
			{
				onSuccess: (upiPaymentUrl) => {
					if (upiPaymentUrl) {
						setIsAwaitingPaymentReturn(true);
						hasGoneHiddenRef.current = false;
						window.location.assign(upiPaymentUrl);
					} else {
						setSettlementMode("later");
						setIsSettlementDialogOpen(true);
					}
				},
			},
		);
	};

	useEffect(() => {
		if (!isAwaitingPaymentReturn) return;

		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				hasGoneHiddenRef.current = true;
				return;
			}

			if (hasGoneHiddenRef.current) {
				setIsAwaitingPaymentReturn(false);
				setSettlementMode("confirm");
				setIsSettlementDialogOpen(true);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [isAwaitingPaymentReturn]);

	if (!currentUserId || !iOweThem) {
		return null;
	}

	return (
		<>
			<Button
				variant="outline"
				size="xs"
				onClick={handleSettle}
				disabled={checkUpiMutation.isPending || settleMutation.isPending}
			>
				Settle
			</Button>

			<AlertDialog
				open={isSettlementDialogOpen}
				onOpenChange={(open) => {
					setIsSettlementDialogOpen(open);
					if (!open) setSettlementMode(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{settlementMode === "upi"
								? "Open your UPI app?"
								: settlementMode === "confirm"
									? "Did you complete the payment?"
									: "UPI ID unavailable"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{settlementMode === "upi"
								? `Pay ${receiverName} ${formatCurrency(Math.abs(amountOwed))} using your preferred UPI app.`
								: settlementMode === "confirm"
									? "Only mark this as settled if the payment was completed successfully."
									: `${receiverName} has not added a UPI ID. You can pay them later and record this amount as settled now.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setIsSettlementDialogOpen(false);
								setSettlementMode(null);
								recordSettlement();
							}}
						>
							{settlementMode === "upi"
								? "Open UPI"
								: settlementMode === "confirm"
									? "Yes, mark as settled"
									: "Record as settled"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
