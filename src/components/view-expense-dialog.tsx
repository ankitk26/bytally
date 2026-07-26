import { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { formatCurrency } from "~/lib/format-currency";
import { formatDate } from "~/lib/format-date";

type Contributor = {
	contributorId: Id<"users">;
	amount: number;
	username: string;
};

type Expense = {
	_id: Id<"expenses">;
	title: string;
	description?: string;
	amount: number;
	paidBy: Id<"users">;
	paidByUsername: string;
	expenseTime: number;
	splitMode: "equal" | "manual";
	contributors: Contributor[];
};

type Props = {
	expense: Expense;
	children: React.ReactElement;
};

export default function ViewExpenseDialog({ expense, children }: Props) {
	return (
		<Dialog>
			<DialogTrigger render={children} />
			<DialogContent className="max-h-[85vh] w-[95vw] overflow-y-auto text-sm sm:max-w-lg md:max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-base">Expense Details</DialogTitle>
					<DialogDescription className="text-sm">
						Review this expense information.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-1">
						<span className="text-xs text-muted-foreground">Title</span>
						<span className="text-sm font-medium text-foreground">
							{expense.title}
						</span>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="grid gap-1">
							<span className="text-xs text-muted-foreground">Amount</span>
							<span className="text-sm font-semibold text-foreground">
								{formatCurrency(expense.amount)}
							</span>
						</div>
						<div className="grid gap-1">
							<span className="text-xs text-muted-foreground">Date</span>
							<span className="text-sm text-foreground">
								{formatDate(expense.expenseTime)}
							</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="grid gap-1">
							<span className="text-xs text-muted-foreground">Paid by</span>
							<span className="text-sm text-foreground">
								{expense.paidByUsername}
							</span>
						</div>
						<div className="grid gap-1">
							<span className="text-xs text-muted-foreground">Split mode</span>
							<span className="text-sm text-foreground capitalize">
								{expense.splitMode}
							</span>
						</div>
					</div>
					<div className="grid gap-2">
						<span className="text-xs text-muted-foreground">Contributors</span>
						<div className="grid gap-2 border p-2">
							{expense.contributors.length === 0 && (
								<span className="text-sm text-muted-foreground">
									No contributors listed.
								</span>
							)}
							{expense.contributors.map((contributor) => (
								<div
									key={contributor.contributorId}
									className="flex items-center justify-between text-sm"
								>
									<span className="truncate">{contributor.username}</span>
									<span className="font-medium text-foreground">
										{formatCurrency(contributor.amount)}
									</span>
								</div>
							))}
						</div>
					</div>
					{expense.description && (
						<div className="grid gap-1">
							<span className="text-xs text-muted-foreground">Description</span>
							<p className="text-sm whitespace-pre-wrap text-foreground">
								{expense.description}
							</p>
						</div>
					)}
				</div>
				<DialogFooter>
					<DialogClose render={<Button variant="outline">Close</Button>} />
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
