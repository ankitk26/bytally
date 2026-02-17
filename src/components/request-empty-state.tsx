import { HugeiconsIcon } from "@hugeicons/react";

export interface Props {
	icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
	title: string;
	description: string;
}

export function RequestEmptyState({ icon, title, description }: Props) {
	return (
		<div className="border-border border border-dashed py-16 text-center">
			<div className="mb-3 inline-flex">
				<HugeiconsIcon
					icon={icon}
					className="text-muted-foreground h-8 w-8"
					strokeWidth={1.5}
				/>
			</div>
			<p className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
				{title}
			</p>
			<p className="text-foreground font-serif text-lg">{description}</p>
		</div>
	);
}
