import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import { useTranslation } from 'react-i18next'

type Props = {
	bookclubId: string
}

export const bookClubGoCycleSetting = ({ bookclubId }: Props) => {
	const { t } = useTranslation()

	return (
		<Card className="card-base">
			<SectionHeader title={t('club.adminPanelTitle', { ns: 'pages' })} />
			<div className="flex gap-2 md:gap-4 px-4 sm:px-6 md:px-8">
				<Button asChild className="flex-1 min-w-0">
					<Link to={`/newcycle/${bookclubId}`}>{t('actions.manageCycle')}</Link>
				</Button>
				<Button asChild className="flex-1 min-w-0">
					<Link to={`/bookclubsettings/${bookclubId}`}>{t('actions.manageClub')}</Link>
				</Button>
			</div>
		</Card>
	)
}

export default bookClubGoCycleSetting
