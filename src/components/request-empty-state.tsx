import { HugeiconsIcon } from "@hugeicons/react";

type Props = {
	icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
	title: string;
	description: string;
};

export default function RequestEmptyState({ icon, title, description }: Props) {
	return (
		<div className="border-border border border-dashed py-12 text-center sm:py-16">
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
