import { ClockIcon } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { InputField } from '@/components/ui/input-field'

export type TimePickerProps = {
	value: string
	onChange: (time: string) => void
	disabled?: boolean
	label?: string
	id?: string
}

export function TimePicker({ value, onChange, disabled, label, id }: TimePickerProps) {
	const [rawHours = '12', rawMinutes = '00'] = value.split(':')
	const selectedHour = /^\d{1,2}$/.test(rawHours) && Number(rawHours) < 24
		? String(Number(rawHours)).padStart(2, '0')
		: '12'
	const selectedMinute = /^\d{1,2}$/.test(rawMinutes) && Number(rawMinutes) < 60
		? String(Number(rawMinutes)).padStart(2, '0')
		: '00'

	const updateTime = (hours: string, minutes: string) => {
		onChange(`${hours}:${minutes}`)
	}

	return (
		<Field className="w-full">
			{label && <FieldLabel htmlFor={id} className="mt-1 text-xs text-muted-foreground">{label}</FieldLabel>}
			<FieldContent>
				<InputField className="h-9 gap-3">
					<div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1">
						<Select value={selectedHour} onValueChange={(hour) => updateTime(hour, selectedMinute)} disabled={disabled}>
							<SelectTrigger aria-label="Hours" className="min-w-0 w-full border-transparent bg-transparent shadow-none hover:bg-muted/60">
								<SelectValue placeholder="HH" />
							</SelectTrigger>
							<SelectContent className="max-h-64">
								{Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0')).map((hour) => (
									<SelectItem key={hour} value={hour}>
										{hour}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<span aria-hidden="true" className="text-sm font-medium text-muted-foreground">:</span>
						<Select value={selectedMinute} onValueChange={(minutes) => updateTime(selectedHour, minutes)} disabled={disabled}>
							<SelectTrigger aria-label="Minutes" className="min-w-0 w-full border-transparent bg-transparent shadow-none hover:bg-muted/60 ">
								<SelectValue placeholder="MM" />
							</SelectTrigger>
							<SelectContent className="max-h-64 ">
								{Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0')).map((minute) => (
									<SelectItem key={minute} value={minute}>
										{minute}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<ClockIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
				</InputField>
			</FieldContent>
		</Field>
	)
}
