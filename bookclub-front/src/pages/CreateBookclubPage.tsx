import BookclubForm from '@/components/BookclubForm'
import { PageHeader } from '../components/PageHeader'
import { Column } from '@/components/Column'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'

const CreateBookclubPage = () => {
	const { t } = useTranslation()

	usePageTitle(t('labels.create'))

	return (
		<>
			<PageHeader
				badgeText={t('labels.create')}
				title={t('createClub.title', { ns: 'pages' })}
				description={t('createClub.description', { ns: 'pages' })}
			/>
			<Column>
				<BookclubForm />
			</Column>
		</>
	)
}

export default CreateBookclubPage
