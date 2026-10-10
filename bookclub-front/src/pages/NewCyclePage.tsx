import { useNavigate, useParams } from 'react-router-dom'
import { NewCycle } from '@/components/NewCycle'
import { EndPhase } from '@/components/EndPhase'
import { PageHeader } from '@/components/PageHeader'
import { type BookClub } from '@/services/bookclubs'
import { useEffect, useState } from 'react'
import { Column } from '@/components/Column'
import { useTranslation } from 'react-i18next'
import bookclubService from '@/services/bookclubs.ts'
import { useNotification } from '@/context/NotificationContext.tsx'
import { getErrorMessage } from '@/lib/errorMessage.ts'

const NewCyclePage = () => {
	const { t } = useTranslation()
	const { bookclubId } = useParams<{ bookclubId: string }>()

	const { showError } = useNotification()
	const [loadedClub, setLoadedClub] = useState<BookClub | undefined>()
	const [isLoading, setIsLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		if (!bookclubId) {
			void navigate('/')
			return
		}

		const fetchBookclub = async () => {
			setIsLoading(true)
			try {
				const bookclub = await bookclubService.get(bookclubId)
				if (!bookclub) {
					void navigate('/')
					return
				}
				setLoadedClub(bookclub)
			} catch (error) {
				const errorMessage = getErrorMessage(error)
				showError('Failed to load book club: ' + errorMessage)
				void navigate('/') // Redirect to home page on error
			} finally {
				setIsLoading(false)
			}
		}

		void fetchBookclub()
	}, [bookclubId])

	return (
		<>
			<PageHeader
				badgeText={t('labels.cycle')}
				title={isLoading ? '' : (loadedClub?.name ?? 'Bookclub')}
				description=""
				buttonText="Back"
				buttonOnClick={async () => {
					await navigate(`/club/${loadedClub?.id ?? ''}`)
				}}
			/>
			<Column>
				<NewCycle bookclubId={bookclubId} />
				<EndPhase bookclubId={bookclubId} />
			</Column>
		</>
	)
}

export default NewCyclePage
