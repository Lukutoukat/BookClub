import bookclubService from '../services/bookclubs'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import { ButtonDialog } from './ButtonDialog'
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
			<div className="flex justify-end border-t border-border/60 pt-4 sm:pt-4">
				<ButtonDialog
					buttonText="Delete club"
					buttonOnClick={handleDeletion}
					alertDialogDescription="Once the book club is deleted, it cannot be undone."
				/>
			</div>
			<div className="grid gap-5 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] sm:gap-8" />
		</>
	)
}

export default ClubSettingsDisplay
