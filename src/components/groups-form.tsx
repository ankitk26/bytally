import { useConvexMutation } from "@convex-dev/react-query";
import { SpinnerIcon, XIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

type Props = {
	showBorder?: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
	return EMAIL_REGEX.test(email.trim().toLowerCase());
}

export default function GroupsForm({ showBorder = true }: Props) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [emails, setEmails] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [inputError, setInputError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { mutate, isPending } = useMutation({
		mutationFn: useConvexMutation(api.groups.create),
	});

	const addEmail = (raw: string) => {
		const email = raw.trim().toLowerCase();
		if (!email) return false;

		if (!isValidEmail(email)) {
			setInputError("Enter a valid email address");
			return false;
		}

		if (emails.includes(email)) {
			setInputError("This email is already added");
			return false;
		}

		setEmails((prev) => [...prev, email]);
		setInputValue("");
		setInputError(null);
		return true;
	};

	const removeEmail = (email: string) => {
		setEmails((prev) => prev.filter((e) => e !== email));
	};

	const handleChipClick = (email: string) => {
		if (inputValue === "") {
			setInputValue(email);
			setInputError(null);
		}
	};

	const handleInputKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addEmail(inputValue);
		} else if (
			e.key === "Backspace" &&
			inputValue === "" &&
			emails.length > 0
		) {
			setEmails((prev) => prev.slice(0, -1));
		}
	};

	const handleInputChange = (value: string) => {
		setInputValue(value);
		if (inputError) setInputError(null);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name.trim()) return;

		mutate(
			{
				name,
				description,
				memberEmails: emails,
			},
			{
				onSuccess: () => {
					setName("");
					setDescription("");
					setEmails([]);
					setInputValue("");
					setInputError(null);
				},
			},
		);
	};

	return (
		<div className={showBorder ? "border border-border p-5" : ""}>
			<p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">
				New group
			</p>
			<h2 className="mb-4 font-serif text-lg text-foreground">
				Create a group
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<Label htmlFor="name" className="text-xs text-muted-foreground">
						Name
					</Label>
					<Input
						id="name"
						name="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Flatmates"
						required
					/>
				</div>

				<div className="space-y-1.5">
					<Label
						htmlFor="description"
						className="text-xs text-muted-foreground"
					>
						Description <span className="opacity-50">(optional)</span>
					</Label>
					<Textarea
						id="description"
						name="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="What's this group about?"
						rows={2}
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">
						Members <span className="opacity-50">(optional)</span>
					</Label>

					<div className="flex flex-wrap items-center gap-1.5 border border-border bg-transparent px-2.5 py-1.5 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
						{emails.map((email) => (
							<button
								type="button"
								key={email}
								onClick={() => handleChipClick(email)}
								className="group inline-flex h-6 cursor-pointer items-center gap-1 bg-secondary px-1.5 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80"
							>
								<span className="max-w-[10rem] truncate">{email}</span>
								<span
									role="button"
									tabIndex={-1}
									onClick={(e) => {
										e.stopPropagation();
										removeEmail(email);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.stopPropagation();
											removeEmail(email);
										}
									}}
									className="ml-0.5 inline-flex cursor-pointer p-0.5 text-muted-foreground transition-colors hover:text-foreground"
								>
									<XIcon weight="bold" size={10} />
								</span>
							</button>
						))}
						<input
							ref={inputRef}
							type="text"
							value={inputValue}
							onChange={(e) => handleInputChange(e.target.value)}
							onKeyDown={handleInputKeyDown}
							placeholder={emails.length === 0 ? "Enter email addresses" : ""}
							className="min-w-[12rem] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
						/>
					</div>

					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="xs"
							disabled={!inputValue.trim()}
							onClick={() => addEmail(inputValue)}
						>
							Add email
						</Button>
						{inputError && (
							<p className="animate-in text-xs text-destructive fade-in">
								{inputError}
							</p>
						)}
					</div>

					{emails.length > 0 && !inputError && (
						<p className="text-xs text-muted-foreground">
							{emails.length} member{emails.length === 1 ? "" : "s"} will be
							invited
						</p>
					)}
				</div>

				<Button
					type="submit"
					disabled={isPending || !name.trim()}
					className="w-full"
				>
					{isPending ? <SpinnerIcon className="animate-spin" /> : "Create"}
				</Button>
			</form>
		</div>
	);
}
