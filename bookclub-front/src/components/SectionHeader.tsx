import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface SectionHeaderProps {
	title: string
	description?: string
	children?: React.ReactNode
}

/**
 * SectionHeader is a reusable component for displaying consistent card section headers across the application
 * @param title - the main title of the section
 * @param description - optional description text displayed below the title
 * @returns
 */
export const SectionHeader = ({ title, description, children }: SectionHeaderProps) => {
	return (
		<CardHeader className="card-header section-header">
			<div className="flex flex-col">
				<CardTitle className="section-title">{title}</CardTitle>
				{description && (
					<CardDescription className="section-description">{description}</CardDescription>
				)}
			</div>
			{children && <div className="shrink-0">{children}</div>}
		</CardHeader>
	)
}
