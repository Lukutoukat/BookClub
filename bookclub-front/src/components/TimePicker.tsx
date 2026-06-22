import * as React from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'

export type TimePickerProps = {
	value: string
	onChange: (time: string) => void
	disabled?: boolean
	step?: number
}

export function TimePicker({ value, onChange, disabled, step = 30 }: TimePickerProps) {
	const timeOptions = React.useMemo(() => {
		const options: string[] = []
		for (let i = 0; i < 24; i++) {
			for (let j = 0; j < 60; j += step) {
				const hour = i.toString().padStart(2, '0')
				const minute = j.toString().padStart(2, '0')
				options.push(`${hour}:${minute}`)
			}
		}
		return options
	}, [step])

	return (
		<div className="">
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder="HH:MM" />
				</SelectTrigger>

				<SelectContent className="!max-h-128">
					{timeOptions.map((time) => (
						<SelectItem key={time} value={time}>
							{time}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
