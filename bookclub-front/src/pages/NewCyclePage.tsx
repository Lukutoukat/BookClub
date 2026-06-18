import { useParams } from 'react-router-dom'
import { NewCycle } from '@/components/NewCycle'
import { EndPhase } from '@/components/EndPhase'
import { PageHeader } from '@/components/PageHeader'
import { useNavigate } from 'react-router-dom'
import bookClubService, { type BookClub } from '@/services/bookclubs'
import React, { useState, useEffect } from 'react'
import { Grid } from '@/components/Grid'

const NewCyclePage = () => {
	const { bookclubId } = useParams<{ bookclubId: string }>()
	const [loadedClubs, setLoadedClubs] = useState<BookClub[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		if (!bookclubId) return

		setIsLoading(true)

		bookClubService
			.get([bookclubId])
			.then((clubs) => {
				setLoadedClubs(clubs)
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
					isLoading || loadedClubs.length === 0
						? 'Loading...'
						: (loadedClubs[0]?.name ?? 'Bookclub')
				}
				description=""
				buttonText="Back"
				buttonOnClick={async () => {
					await navigate(`/club/${loadedClubs[0]?.id ?? ''}`)
				}}
			/>
			<Grid>
				<NewCycle bookclubId={loadedClubs[0]?.id ?? ''} />
				<EndPhase bookclubId={loadedClubs[0]?.id ?? ''} />
			</Grid>
		</>
	)
}

export default NewCyclePage
