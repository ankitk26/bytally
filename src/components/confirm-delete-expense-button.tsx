import { useConvexMutation } from "@convex-dev/react-query";
import { SpinnerIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useState } from "react";
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

type Props = {
	expenseId: Id<"expenses">;
	onExpenseDeleted?: () => void;
	className?: string;
};

export default function ConfirmDeleteExpenseButton({
	expenseId,
	onExpenseDeleted,
	className,
}: Props) {
	const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

	const deleteExpenseMutation = useMutation({
		mutationFn: useConvexMutation(api.expenses.remove),
		onSuccess: () => {
			onExpenseDeleted?.();
		},
	});

	const handleConfirmedDelete = () => {
		deleteExpenseMutation.mutate({ expenseId });
	};

	return (
		<>
			<Button
				variant="destructive"
				className={className}
				onClick={() => setIsConfirmationOpen(true)}
			>
				Delete
			</Button>
			<AlertDialog
				open={isConfirmationOpen}
				onOpenChange={setIsConfirmationOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Expense</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this expense? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmedDelete}
							disabled={deleteExpenseMutation.isPending}
							variant="destructive"
						>
							{deleteExpenseMutation.isPending ? (
								<SpinnerIcon className="animate-spin" />
							) : (
								"Delete"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
