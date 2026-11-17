import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import { ButtonDialog } from './ButtonDialog'
import { Card, CardContent } from './ui/card'
import { SectionHeader } from './SectionHeader'
import { BookclubMemberList } from './BookclubMemberList'
import { useNotification } from '@/context/NotificationContext.tsx'
import { getErrorMessage } from '@/lib/errorMessage.ts'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'

type Props = {
	bookclubId: string
}

export const ClubSettingsDisplay = ({ bookclubId }: Props) => {
	const { t } = useTranslation('pages')
	const navigate = useNavigate()
	const { showError } = useNotification()
	const [isSuggestionLimitEnabled, setIsSuggestionLimitEnabled] = useState(false)
	const [suggestionLimitAmount, setSuggestionLimitAmount] = useState<number>(5)

	const handleDeletion = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
		event.preventDefault()
		try {
			await bookclubService.remove(bookclubId)
			await navigate('/home', { replace: true })
		} catch (error) {
			const errorMessage = getErrorMessage(error)
			showError('Failed to delete club: ' + errorMessage)
		}
	}

	return (
		<>
			<PageHeader
				badgeText={t('labels.settings', { ns: 'common' })}
				title={t('club.settings.title')}
				description={t('club.settings.description')}
				buttonText={t('actions.back', { ns: 'common' })}
				buttonOnClick={async () => {
					try {
						await navigate(`/club/${bookclubId}`)
					} catch {}
				}}
			/>
			<Card className="card-base">
				<SectionHeader 
					title={t('club.settings.manageMembers.title')}
					description={t('club.settings.manageMembers.description')}
				/>
				<CardContent>
					<BookclubMemberList 
						bookclubId={bookclubId}
						canManageMembers={true}
						className='member-list'
					/> 	
				</CardContent>
				<SectionHeader
					title={t('club.settings.manageClub.title')}
					description={t('club.settings.manageClub.description')}
				/>
				<CardContent className="card-content space-y-4">
					<div className="space-y-3">
						<label className="flex items-center gap-3 text-sm font-medium">
							<input
								type="checkbox"
								checked={isSuggestionLimitEnabled}
								onChange={(event) => setIsSuggestionLimitEnabled(event.target.checked)}
								className="h-4 w-4"
							/>
							<span>{t('club.settings.suggestionLimit', { defaultValue: 'Suggestion limit' })}</span>
						</label>

						{isSuggestionLimitEnabled && (
							<div className="space-y-2">
								<label htmlFor="suggestion-limit-amount" className="block text-sm font-medium">
									{t('club.settings.allowedSuggestionAmount', { defaultValue: 'Allowed suggestion amount' })}
								</label>
								<Input
									id="suggestion-limit-amount"
									type="number"
									min={1}
									step={1}
									value={suggestionLimitAmount}
									onChange={(event) => {
										const nextValue = Number(event.target.value)
										setSuggestionLimitAmount(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1)
									}}
									className="max-w-32"
								/>
							</div>
						)}
					</div>

					<ButtonDialog
						buttonText={t('actions.deleteClub', { ns: 'common' })}
						buttonOnClick={handleDeletion}
						alertDialogDescription={t('club.settings.deleteWarning')}
						alertDialogContinueText={t('actions.delete', { ns: 'common' })}
						alertDialogText={t('club.settings.deleteQuestion')}
					/>
				</CardContent>
			</Card>
		</>
	)
}

export default ClubSettingsDisplay
