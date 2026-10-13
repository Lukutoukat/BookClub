import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/input-field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SectionHeader } from './SectionHeader'
import { TimePicker } from './TimePicker'

type Props = {
	dateRange: DateRange | undefined
	setDateRange: (range: DateRange | undefined) => void
	children: React.ReactNode
}

export const RangeCalendarComponent = ({ dateRange, setDateRange, children }: Props) => {
	const formatTimeValue = (date: Date | undefined) => {
		if (!date) return '12:00'
		return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
	}

	const [startTime, setStartTime] = useState(() => formatTimeValue(dateRange?.from))
	const [endTime, setEndTime] = useState(() => formatTimeValue(dateRange?.to))
	const [openPicker, setOpenPicker] = useState<'suggestions' | 'voting' | null>(null)

	useEffect(() => {
		if (dateRange?.from) setStartTime(formatTimeValue(dateRange.from))
		if (dateRange?.to) setEndTime(formatTimeValue(dateRange.to))
	}, [dateRange?.from, dateRange?.to])

	const applyTimeToDate = (date: Date, timeString: string): Date => {
		const newDate = new Date(date)
		const [hours, minutes, seconds] = timeString.split(':').map(Number)
		newDate.setHours(hours || 0, minutes || 0, seconds || 0, 0)
		return newDate
	}

	const formatDate = (date: Date | undefined) => {
		if (!date) return 'Choose a date'
		return new Intl.DateTimeFormat(navigator.language).format(date)
	}

	const formatDateTime = (date: Date | undefined) => {
		if (!date) return 'Choose date and time'
		return `${formatDate(date)} · ${formatTimeValue(date)}`
	}

	const handleSuggestionsDateSelect = (date: Date | undefined) => {
		if (!date) return
		const proposalEnd = applyTimeToDate(date, startTime)
		if (dateRange?.to && proposalEnd >= dateRange.to) return
		setDateRange({ from: proposalEnd, to: dateRange?.to })
		setOpenPicker(null)
	}

	const handleVotingDateSelect = (date: Date | undefined) => {
		if (!date) return
		const votingEnd = applyTimeToDate(date, endTime)
		if (dateRange?.from && votingEnd <= dateRange.from) return
		setDateRange({ from: dateRange?.from, to: votingEnd })
		setOpenPicker(null)
	}

	const handleStartTimeChange = (newTime: string) => {
		if (dateRange?.from) {
			const updatedFrom = applyTimeToDate(dateRange.from, newTime)
			if (dateRange.to && updatedFrom >= dateRange.to) return
			setStartTime(newTime)
			setDateRange({
				...dateRange,
				from: updatedFrom
			})
			return
		}
		setStartTime(newTime)
	}

	const handleEndTimeChange = (newTime: string) => {
		if (dateRange?.to) {
			const updatedTo = applyTimeToDate(dateRange.to, newTime)
			if (dateRange.from && updatedTo <= dateRange.from) return
			setEndTime(newTime)
			setDateRange({
				...dateRange,
				to: updatedTo
			})
			return
		}
		setEndTime(newTime)
	}

	return (
		<>
			<Card className="card-base w-full max-w-full overflow-hidden">
				<SectionHeader
					title={'Select Dates'}
					description={'Select the end dates for the suggesting and voting phases.'}
				/>
				<CardContent className="card-content p-4 sm:p-6">
					<FieldGroup className="grid gap-4 sm:grid-cols-2">
						<Field className="min-w-0">
							<div className="space-y-3 rounded-lg border border-border/70 bg-background/60 p-3 sm:p-4">
								<div>
									<p className="text-sm font-semibold text-foreground">Suggestion phase ends</p>
									<p className="mt-1 text-xs text-muted-foreground">Set the date and closing time for suggestions phase.</p>
								</div>
								<FieldContent className="gap-3">
									<Popover
										open={openPicker === 'suggestions'}
										onOpenChange={(open) => setOpenPicker(open ? 'suggestions' : null)}
									>
										<PopoverTrigger asChild>
											<InputField asChild>
												<Button type="button" variant="outline" aria-label="Suggestion phase ends" className="justify-between gap-3 whitespace-normal text-left">
													<span className={dateRange?.from ? 'font-medium text-foreground' : 'text-muted-foreground'}>
														{formatDateTime(dateRange?.from)}
													</span>
													<CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
												</Button>
											</InputField>
										</PopoverTrigger>
										<PopoverContent align="start" className="w-auto p-2">
											<Calendar
												mode="single"
												selected={dateRange?.from}
												defaultMonth={dateRange?.from ?? new Date()}
												onSelect={handleSuggestionsDateSelect}
												numberOfMonths={1}
												disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || (dateRange?.to !== undefined && applyTimeToDate(date, startTime) >= dateRange.to)}
											/>
										</PopoverContent>
									</Popover>
									<FieldLabel htmlFor="time-from" className="mt-1 text-xs text-muted-foreground">Phase end time</FieldLabel>
									<TimePicker value={startTime} onChange={handleStartTimeChange} disabled={!dateRange?.from} />
								</FieldContent>
							</div>
						</Field>

						<Field className="min-w-0">
							<div className="space-y-3 rounded-lg border border-border/70 bg-background/60 p-3 sm:p-4">
								<div>
									<p className="text-sm font-semibold text-foreground">Voting phase ends</p>
									<p className="mt-1 text-xs text-muted-foreground">Set the date and closing time for voting phase.</p>
								</div>
								<FieldContent className="gap-3">
									<Popover
										open={openPicker === 'voting'}
										onOpenChange={(open) => setOpenPicker(open ? 'voting' : null)}
									>
										<PopoverTrigger asChild>
											<InputField asChild>
												<Button type="button" variant="outline" aria-label="Voting phase ends" className="justify-between gap-3 whitespace-normal text-left">
													<span className={dateRange?.to ? 'font-medium text-foreground' : 'text-muted-foreground'}>
														{formatDateTime(dateRange?.to)}
													</span>
													<CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
												</Button>
											</InputField>
										</PopoverTrigger>
										<PopoverContent align="start" className="w-auto p-2">
											<Calendar
												mode="single"
												selected={dateRange?.to}
												defaultMonth={dateRange?.to ?? dateRange?.from ?? new Date()}
												onSelect={handleVotingDateSelect}
												numberOfMonths={1}
												disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || (dateRange?.from !== undefined && applyTimeToDate(date, endTime) <= dateRange.from)}
											/>
										</PopoverContent>
									</Popover>
									<FieldLabel htmlFor="time-to" className="mt-1 text-xs text-muted-foreground">Phase end time</FieldLabel>
									<TimePicker value={endTime} onChange={handleEndTimeChange} disabled={!dateRange?.to} />
								</FieldContent>
							</div>
						</Field>
					</FieldGroup>
				</CardContent>
				{children}
			</Card>
		</>
	)
}
