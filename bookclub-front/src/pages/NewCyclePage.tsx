import { useParams } from 'react-router-dom'
import { NewCycle } from '@/components/NewCycle'
import { EndPhase } from '@/components/EndPhase'
import { PageHeader } from '@/components/PageHeader'
import { useNavigate } from 'react-router-dom'
import bookClubService, { type BookClub } from '@/services/bookclubs'
import { useState, useEffect } from 'react'
import { Column } from '@/components/Column'

const NewCyclePage = () => {
	const { bookclubId } = useParams<{ bookclubId: string }>()
	const [loadedClub, setLoadedClub] = useState<BookClub | undefined>()
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		if (!bookclubId) {
			void navigate('/')
			return
		}

		setIsLoading(true)

		bookClubService
			.get(bookclubId)
			.then((club) => {
				setLoadedClub(club)
				setIsLoading(false)
			})
			.catch((error) => {
				setIsLoading(false)
				console.error('Failed to load book club:', error)
				void navigate('/') // Redirect to home page on error
			})
	}, [bookclubId])

	return (
		<>
			<PageHeader
				badgeText="New Cycle"
				title={
					isLoading
						? 'Loading...'
						: (loadedClub?.name ?? 'Bookclub')
				}
				description=""
				buttonText="Back"
				buttonOnClick={async () => {
					await navigate(`/club/${loadedClub?.id ?? ''}`)
				}}
			/>
			<Column>
				<NewCycle bookclubId={loadedClub?.id ?? ''} />
				<EndPhase bookclubId={loadedClub?.id ?? ''} />
			</Column>
		</>
	)
}

export default NewCyclePage
