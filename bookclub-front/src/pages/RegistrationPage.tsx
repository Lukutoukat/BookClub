import RegistrationForm from '@/components/RegistrationForm'

import { usePageTitle } from '@/hooks/usePageTitle'
import { PageHeader } from '@/components/PageHeader'
import { Column } from '@/components/Column'
import { useTranslation } from 'react-i18next'

const RegistrationPage = () => {
	const { t } = useTranslation()

	usePageTitle(t('labels.registration'))

	return (
		<>
			<PageHeader
				badgeText={t('labels.registration')}
				title={t('user.title', { ns: 'pages' })}
				description={t('user.description', { ns: 'pages' })}
				buttonText={t('actions.loginTab')}
				buttonLink="/login"
			/>

			<Column>
				<RegistrationForm />
			</Column>
		</>
	)
}

export default RegistrationPage
