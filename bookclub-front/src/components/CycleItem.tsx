import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { type CycleFields } from '@/services/cycle'
import { Badge } from './ui/badge'
import type { BookResult } from '@/services/results'
import ResultService from '@/services/results'
import ErrorMessageDisplay from './errorMessageDisplay'
import { getErrorMessage } from '@/lib/errorMessage'
import { useTranslation } from 'react-i18next'

type Props = {
	cycle: CycleFields
}

const CycleItem = ({ cycle }: Props) => {
	const { t } = useTranslation('pages')
	const [winner, setWinner] = useState<BookResult | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const removeErrorMessage = () => {
		setErrorMessage(null)
	}

	const formatDate = (date: Date | string | undefined) => {
		if (!date) return 'N/A'
		const d = new Date(date)
		return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
	}

	const determineCycleStatus = () => {
		const now = new Date()
		if (cycle.votingEnd && new Date(cycle.votingEnd) < now) return 'completed'
		if (cycle.proposalEnd && new Date(cycle.proposalEnd) < now) return 'voting'
		return 'suggest'
	}

	const status = determineCycleStatus()
	const statusLabel = t(`labels.${status}`, { ns: 'common' })

	const loadWinner = async () => {
		removeErrorMessage()
		try {
			const winningBook: BookResult = await ResultService.getWinner(cycle.id)
			setWinner(winningBook)
		} catch (error) {
			setErrorMessage(getErrorMessage(error, t('error.api.fetchWinner', { ns: 'messages' })))
		}
	}

	useEffect(() => {
		if (status === 'completed') {
			void loadWinner()
		}
	}, [status, cycle.id])

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm transition-all hover:bg-background/90">
			<CardContent className="px-3 py-4 sm:px-4 pl-4 sm:pl-5 flex flex-col gap-3">
				<Badge>{statusLabel}</Badge>

				<div className="space-y-1">
					<div className="flex flex-row items-center justify-between">
						<h3 className="font-medium text-sm text-muted-foreground">{t('club.cycle.phase.suggestPhase')}</h3>
						<p className="text-sm">
							{' '}
							{formatDate(cycle.createdAt)} - {formatDate(cycle.proposalEnd)}{' '}
						</p>
					</div>
					<div className="flex flex-row items-center justify-between">
						<h3 className="font-medium text-sm text-muted-foreground">{t('club.cycle.phase.votingPhase')}</h3>
						<p className="text-sm">
							{' '}
							{formatDate(cycle.proposalEnd)} - {formatDate(cycle.votingEnd)}{' '}
						</p>
					</div>
				</div>

				{status === 'completed' && (
					<div className="mt-2 pt-3 border-t border-border/40">
						<h4 className="font-semibold text-sm text-foreground">{t('club.cycle.phase.winning')}</h4>
						{winner ? (
							<p className="text-sm font-medium mt-0.5 text-primary">
								{winner.name}
								{winner.score !== undefined && (
									<span className="text-xs text-muted-foreground ml-2">({winner.score} {t('labels.points', { ns: 'common' })})</span>
								)}
							</p>
						) : (
							<p className="text-sm italic text-muted-foreground mt-0.5">
								{errorMessage ? t('error.api.loadWinner', { ns: 'messages' }) : t('neutral.loadingVotes', { ns: 'messages' })}
							</p>
						)}
					</div>
				)}
				<ErrorMessageDisplay message={errorMessage as string} remove={removeErrorMessage} />
			</CardContent>
		</Card>
	)
}

export default CycleItem
