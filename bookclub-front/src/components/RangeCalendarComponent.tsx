import { useState } from 'react'
import { Clock2Icon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { SectionHeader } from './SectionHeader'
import { TimePicker } from './TimePicker'

type Props = {
	dateRange: DateRange | undefined
	setDateRange: (range: DateRange | undefined) => void
	children: React.ReactNode
}

export const RangeCalendarComponent = ({ dateRange, setDateRange, children }: Props) => {
	const [startTime, setStartTime] = useState('12:00')
	const [endTime, setEndTime] = useState('12:00')

	const applyTimeToDate = (date: Date, timeString: string): Date => {
		const newDate = new Date(date)
		const [hours, minutes, seconds] = timeString.split(':').map(Number)
		newDate.setHours(hours || 0, minutes || 0, seconds || 0, 0)
		return newDate
	}

	const handleDateSelect = (newRange: DateRange | undefined) => {
		if (!newRange) {
			setDateRange(undefined)
			return
		}

		const updatedRange: DateRange = { ...newRange }

		if (updatedRange.from) {
			updatedRange.from = applyTimeToDate(updatedRange.from, startTime)
		}
		if (updatedRange.to) {
			updatedRange.to = applyTimeToDate(updatedRange.to, endTime)
		}

		setDateRange(updatedRange)
	}

	const handleStartTimeChange = (newTime: string) => {
		setStartTime(newTime)

		if (dateRange?.from) {
			setDateRange({
				...dateRange,
				from: applyTimeToDate(dateRange.from, newTime)
			})
		}
	}

	const handleEndTimeChange = (newTime: string) => {
		setEndTime(newTime)

		if (dateRange?.to) {
			setDateRange({
				...dateRange,
				to: applyTimeToDate(dateRange.to, newTime)
			})
		}
	}

	return (
		<>
			<Card className="card-base w-full max-w-full overflow-hidden">
				<SectionHeader
					title={'Select Dates'}
					description={
						'Select the end date the suggesting phase and the end date for voting phase.'
					}
				/>
				<CardContent className="card-content flex justify-center p-4 sm:p-6">
					<div className="w-full flex justify-center overflow-visible">
						<Calendar
							className="mx-auto [&_.rdp-months]:!flex-row [&_.rdp-months]:!flex-wrap [&_.rdp-months]:justify-center [&_.rdp-months]:gap-4 [&_.rdp-months]:!space-x-0 [&_.rdp-months]:!space-y-0"
							mode="range"
							defaultMonth={new Date()}
							selected={dateRange}
							onSelect={handleDateSelect}
							numberOfMonths={2}
							disabled={(date) => date < new Date('1900-01-01') || date < new Date()}
						/>
					</div>
				</CardContent>
				<CardFooter className="border-t bg-card py-6">
					<FieldGroup className="flex flex-col gap-6 w-full">
						<Field>
							<FieldLabel htmlFor="time-from">Suggesting End Time</FieldLabel>
							<div className="flex items-center gap-3 mt-2">
								<Clock2Icon className="text-muted-foreground w-5 h-5" />
								<TimePicker
									value={startTime}
									onChange={handleStartTimeChange}
									disabled={!dateRange?.from}
								/>
							</div>
						</Field>

						<Field>
							<FieldLabel htmlFor="time-to">Voting End Time</FieldLabel>
							<div className="flex items-center gap-3 mt-2">
								<Clock2Icon className="text-muted-foreground w-5 h-5" />
								<TimePicker
									value={endTime}
									onChange={handleEndTimeChange}
									disabled={!dateRange?.to}
								/>
							</div>
						</Field>
					</FieldGroup>
				</CardFooter>
				{children}
			</Card>
		</>
	)
}
