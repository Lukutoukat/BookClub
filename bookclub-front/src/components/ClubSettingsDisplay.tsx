import bookclubService from '../services/bookclubs'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import { ButtonDialog } from './ButtonDialog'
import { Card, CardContent } from './ui/card'
import { SectionHeader } from './SectionHeader'
type Props = {
	bookclubId: string
}

export const ClubSettingsDisplay = ({ bookclubId }: Props) => {
	const navigate = useNavigate()
	const handleDeletion = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
		event.preventDefault()
		try {
			await bookclubService.remove(bookclubId)
			await navigate('/home', { replace: true })
		} catch (error) {
			console.error('error during deletion', error)
		}
	}

	return (
		<>
			<PageHeader
				badgeText="Settings"
				title="Book Club Settings"
				description="Suggest books and decide your next read together."
				buttonText="Back"
				buttonOnClick={async () => {
					try {
						await navigate(`/club/${bookclubId}`)
					} catch {}
				}}
			/>
			<Card className="card-base">
			<SectionHeader title="Club Settings" description="You can remove your book club and all information related to it below" />
			<CardContent className="card-content">
				<ButtonDialog
					buttonText="Delete club"
					buttonOnClick={handleDeletion}
					alertDialogDescription="Once the book club is deleted, it cannot be undone."
					alertDialogContinueText="Delete"
					alertDialogText="Are you sure you want to delete this book club?"
				/>
				</CardContent>
			</Card>
		</>
	)
}

export default ClubSettingsDisplay
