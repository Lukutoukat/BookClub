import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import cycleService from '../services/cycle'
import { useState } from 'react'
import ErrorMessageDisplay from './errorMessageDisplay'
import { getErrorMessage } from '@/lib/errorMessage'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ButtonDialog } from './ButtonDialog'

type Props = {
	bookclubId?: string
}

export const EndPhase = ({ bookclubId }: Props) => {
	const { t } = useTranslation('pages')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const navigate = useNavigate()

	const removeErrorMessage = () => {
		setErrorMessage(null)
	}

	const handleEndPhase = async (id: string) => {
		removeErrorMessage()

		try {
			await cycleService.endLatestCyclePhase(id)
			await navigate('/club/' + bookclubId)
		} catch (error) {
			setErrorMessage(getErrorMessage(error, t('error.api.endPhase', { ns: 'messages' })))
		}
	}

	if (!bookclubId) {
		return null
	}

	return (
		<Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
			<CardHeader className="border-b border-border/60 py-4 sm:py-8">
				<CardTitle className="text-xl sm:text-2xl">{t('club.cycle.phase.title')}</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4 pt-4 sm:space-y-4 sm:pt-6">
				<div className="space-y-2">
					<ButtonDialog
						buttonText={t('club.cycle.phase.endCurrentPhase')}
						alertDialogDescription={t('club.cycle.phase.warning')}
						buttonOnClick={() => void handleEndPhase(bookclubId)}
					/>
				</div>
				<ErrorMessageDisplay message={errorMessage as string} remove={removeErrorMessage} />
			</CardContent>
		</Card>
	)
}
