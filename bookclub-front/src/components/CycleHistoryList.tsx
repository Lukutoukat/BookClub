import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import CycleService, { type CycleFields } from '@/services/cycle'
import ErrorMessageDisplay from './errorMessageDisplay'
import { getErrorMessage } from '@/lib/errorMessage'
import CycleItem from './CycleItem'

type Props = {
	bookclubId: string
}

const CycleHistoryList = ({ bookclubId }: Props) => {
	const { t } = useTranslation()
	const [cycles, setCycles] = useState<CycleFields[]>([])
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const removeErrorMessage = () => {
		setErrorMessage(null)
	}

	const loadCycles = async () => {
		removeErrorMessage()

		try {
			const loadedCycles = await CycleService.getClubCycles(bookclubId)
			setCycles(loadedCycles)
			setCycles(Array.isArray(loadedCycles) ? loadedCycles : [])
		} catch (error) {
			setCycles([])
			setErrorMessage(getErrorMessage(error, t('error.api.fetchCycles', { ns: 'messages' })))
		}
	}

	useEffect(() => {
		void loadCycles()
	}, [bookclubId])

	return (
		<Card className="card-base">
			<SectionHeader title={t('club.cycle.title', { count: cycles.length, ns: 'pages' })} />
			<CardContent className="card-content">
				<div className="space-y-3">
					{cycles.map((cycle) => (
						<CycleItem key={cycle.id} cycle={cycle} />
					))}
				</div>
				<ErrorMessageDisplay message={errorMessage as string} remove={removeErrorMessage} />
			</CardContent>
		</Card>
	)
}

export default CycleHistoryList
