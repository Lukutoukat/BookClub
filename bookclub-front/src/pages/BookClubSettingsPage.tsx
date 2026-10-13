import { useParams } from 'react-router-dom'
import ClubSettingsDisplay from '@/components/ClubSettingsDisplay'
import { useTranslation } from 'react-i18next'

const ClubSettingsPage = () => {
	const { t } = useTranslation('messages')
	const { bookclubId } = useParams<{ bookclubId: string }>()

	if (!bookclubId) return <div>{t('error.validation.bookclubIdMissing')}</div>

	return (
		<>
			<ClubSettingsDisplay bookclubId={bookclubId} />
		</>
	)
}

export default ClubSettingsPage
