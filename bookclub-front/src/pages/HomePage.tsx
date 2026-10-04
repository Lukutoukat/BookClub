import { PageHeader } from '../components/PageHeader'
import BookClubList from '@/components/BookClubList'
import JoinBookClubForm from '@/components/JoinBookClubForm'
import { useGetClubs } from '@/hooks/getClubs'
import { Column } from '@/components/Column'
import { useTranslation } from 'react-i18next'

const HomePage = () => {
	const { bookClubs, isLoading, errorMessage, listMutated } = useGetClubs()
	const { t } = useTranslation()

	return (
		<>
			<PageHeader
				badgeText={t('labels.home')}
				title={t('home.title', { ns: 'pages' })}
				description={t('home.description', { ns: 'pages' })}
			/>
			<Column>
				<BookClubList bookClubs={bookClubs} isLoading={isLoading} errorMessage={errorMessage} />
				<JoinBookClubForm listMutated={listMutated} />
			</Column>
		</>
	)
}

export default HomePage
