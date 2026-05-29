import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface SectionHeaderProps {
  title: string
  description?: string
}

/**
 * SectionHeader is a reusable component for displaying consistent card section headers across the application
 * @param title - the main title of the section
 * @param description - optional description text displayed below the title
 * @returns
 */
export const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <CardHeader className="card-header">
      <CardTitle className="text-xl sm:text-2xl leading-tight">{title}</CardTitle>
      {description && (
        <CardDescription className="text-xs sm:text-sm leading-snug text-muted-foreground">
          {description}
        </CardDescription>
      )}
    </CardHeader>
  )
}
