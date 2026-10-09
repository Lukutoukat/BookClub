import { Badge } from '@/components/ui/badge'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { ButtonDialog } from './ButtonDialog'
import { UserLoginDisplay } from './UserLoginDisplay'
import { useTranslation } from 'react-i18next'

interface PageHeaderProps {
	badgeText: string
	title: string
	description: string
	buttonText?: string
	buttonLink?: string
	buttonOnClick?: () => void
	afterButtonClick?: 'nothing' | 'alert' | 'confirm'
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
	buttonOnClick,
	afterButtonClick = 'nothing'
}: PageHeaderProps) => {
	const { t } = useTranslation('pages')

	return (
		<header className="flex relative flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 2xl:mb-16">
			<div className="w-full space-y-2 max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
				<div className="absolute top-0 right-0">
					<UserLoginDisplay />
				</div>

				<Badge
					variant="secondary"
					className="w-fit uppercase tracking-[0.2em] text-[0.7rem] sm:text-xs"
				>
					{badgeText}
				</Badge>
				<div className="space-y-2 sm:space-y-4">
					<h1 className="font-heading leading-none text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
						{title}
					</h1>
					<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm sm:leading-normal md:text-base md:leading-6 lg:text-lg max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
						{description}
					</p>
				</div>
			</div>
			{buttonText ? (
				afterButtonClick === 'nothing' ? (
					buttonLink ? (
						<Button asChild variant="outline" className="w-full sm:w-auto">
							<Link to={buttonLink}>{buttonText}</Link>
						</Button>
					) : (
						<Button variant="outline" className="w-full sm:w-auto" onClick={buttonOnClick}>
							{buttonText}
						</Button>
					)
				) : (
					<ButtonDialog
						buttonOnClick={buttonOnClick}
						buttonText={buttonText}
						alertDialogCancelText=""
						alertDialogText={t('club.invite.title')}
						alertDialogDescription={t('club.invite.description')}
						buttonVariant="outline"
					/>
				)
			) : null}
		</header>
	)
}
