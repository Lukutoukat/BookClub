import { Badge } from '@/components/ui/badge'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'

interface PageHeaderProps {
  badgeText: string
  title: string
  description: string
  buttonText?: string
  buttonLink?: string
  buttonOnClick?: () => void
}


/**
 * PageHeader is a reusable component for displaying page titles, descriptions and an action button consistently accross pages
 * @param badgeText - text to be displayed in the badge above the title
 * @param title - the main title of the page
 * @param description - a short description of the page's content or purpose
 * @param buttonText - text for the action button, if provided
 * @param buttonLink - link for the action button, if provided
 * @returns 
 */
export const PageHeader = ({
  badgeText,
  title,
  description,
  buttonText,
  buttonLink,
  buttonOnClick
}: PageHeaderProps) => {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        <Badge
          variant="secondary"
          className="w-fit uppercase tracking-[0.2em] text-[0.7rem] sm:text-xs"
        >
          {badgeText}
        </Badge>
        <div className="space-y-1 sm:space-y-2">
          <h1 className="font-heading text-3xl leading-none sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-xl text-sm leading-5 text-muted-foreground sm:text-base sm:leading-6">
            {description}
          </p>
        </div>
      </div>
      {buttonText ? (
        buttonLink ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={buttonLink}>
              {buttonText}
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={buttonOnClick}
          >
            {buttonText}
          </Button>
        )
      ) : null}
    </header>
  )
}