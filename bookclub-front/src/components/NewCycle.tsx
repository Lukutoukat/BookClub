import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays } from 'date-fns'
import { Button } from './ui/button'
import { RangeCalendarComponent } from './RangeCalendarComponent'
import { type DateRange } from 'react-day-picker'
import cycleService, { type CreateCycle } from '../services/cycle'
import { NewCycleSettings } from './NewCycleSettings'
import { useTranslation } from 'react-i18next'

type Props = {
	bookclubId?: string
}

export const NewCycle = ({ bookclubId }: Props) => {
	const { t } = useTranslation()
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: addDays(new Date(new Date()), 14),
		to: addDays(new Date(new Date()), 28)
	})
	const [votingSystem, setVotingSystem] = useState('three-level')
	const navigate = useNavigate()

	useEffect(() => {
		const fetchLatestCycle = async () => {
			if (!bookclubId) {
				return
			}
			const latestCycle = await cycleService.getLatestCycle(bookclubId)
			if (latestCycle?.votingSystem) {
				setVotingSystem(latestCycle.votingSystem)
			}
		}
		void fetchLatestCycle()
	}, [bookclubId])

	const handleCreate = async () => {
		if (dateRange?.from && dateRange.to) {
			const createdcycle: CreateCycle = {
				bookclub_id: bookclubId,
				proposalEnd: dateRange.from,
				votingEnd: dateRange.to,
				votingSystem: votingSystem
			}
			try {
				await cycleService.create(createdcycle)
				await navigate(`/club/${bookclubId}`)
			} catch (error) {
				console.error('Failed to create cycle:', error)
			}
		}
	}

	if (!bookclubId) {
		return null;
	}

	return (
		<div className="space-y-4">
			<NewCycleSettings votingSystem={votingSystem} setVotingSystem={setVotingSystem} />
			
			<RangeCalendarComponent dateRange={dateRange} setDateRange={setDateRange}>
				<Button onClick={handleCreate} className="w-fit self-end mx-4">
					{t('actions.create')}
				</Button>
			</RangeCalendarComponent>
		</div>
	)
}
