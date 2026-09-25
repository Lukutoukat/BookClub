import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays } from 'date-fns'
import { Button } from './ui/button'
import { RangeCalendarComponent } from './RangeCalendarComponent'
import { type DateRange } from 'react-day-picker'
import cycleService, { type CreateCycle } from '../services/cycle'

type Props = {
	bookclubId?: string
}

export const NewCycle = ({ bookclubId }: Props) => {
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: addDays(new Date(new Date()), 14),
		to: addDays(new Date(new Date()), 28)
	})
	const navigate = useNavigate()

	const handleCreate = async () => {
		if (dateRange?.from && dateRange.to) {
			const createdcycle: CreateCycle = {
				bookclub_id: bookclubId,
				proposalEnd: dateRange.from,
				votingEnd: dateRange.to
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
		<>
			<RangeCalendarComponent dateRange={dateRange} setDateRange={setDateRange}>
				<Button onClick={handleCreate} className="w-fit self-end mx-4">
					Create
				</Button>
			</RangeCalendarComponent>
		</>
	)
}
