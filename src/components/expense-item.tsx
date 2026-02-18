import type { Id } from "convex/_generated/dataModel";
import { useConvexMutation } from "@convex-dev/react-query";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
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
import { formatDate } from "~/lib/format-date";

interface Expense {
	_id: Id<"expenses">;
	title: string;
	description?: string;
	amount: number;
	paidBy: string;
	paidByEmail: string;
	expenseTime: number;
	canDelete?: boolean;
}

interface ExpenseItemProps {
	expense: Expense;
}

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function ExpenseItem({ expense }: ExpenseItemProps) {
	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const deleteMutation = useMutation({
		mutationFn: useConvexMutation(api.expenses.remove),
	});

	const handleDelete = () => {
		deleteMutation.mutate({
			expenseId: expense._id,
		});
	};

	return (
		<article className="flex items-center justify-between gap-3 py-3">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<h3 className="text-foreground truncate text-sm font-medium">
						{expense.title}
					</h3>
					<span className="text-muted-foreground text-xs">
						{formatDate(expense.expenseTime)}
					</span>
				</div>
				<div className="mt-1 flex items-center gap-1.5">
					<div className="bg-muted flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none font-medium">
						{expense.paidByEmail.charAt(0).toUpperCase()}
					</div>
					<span className="text-muted-foreground text-xs">
						{expense.paidByEmail}
					</span>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-foreground text-sm font-semibold">
					{formatCurrency(expense.amount)}
				</span>
				{expense.canDelete && (
					<>
						<Button
							size="icon-xs"
							variant="ghost"
							className="text-muted-foreground hover:text-destructive"
							onClick={() => setIsAlertOpen(true)}
						>
							<HugeiconsIcon
								icon={Delete01Icon}
								className="h-4 w-4"
								strokeWidth={2}
							/>
						</Button>
						<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Expense</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete this expense? This action
										cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										disabled={deleteMutation.isPending}
										variant="destructive"
									>
										{deleteMutation.isPending ? "Deleting..." : "Delete"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</>
				)}
			</div>
		</article>
	);
}
