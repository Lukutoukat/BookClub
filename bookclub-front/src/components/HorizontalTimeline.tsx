import { cn } from '@/lib/utils'

interface TimelineStep {
	title: string
	date: string
}

interface TimelineProps {
	steps: TimelineStep[]
	current: number
}

const HorizontalTimeline = ({ steps, current }: TimelineProps) => {
	const last = steps.length - 1
	const progress = last > 0 ? Math.min(Math.max(current / last, 0), 1) * 100 : 0

	return (
		<div className="relative flex w-full">
			<div className="absolute top-2 right-2 left-2 h-0.5 -translate-y-1/2 bg-primary/40">
				<div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
			</div>

			{steps.map(({ title, date }, index) => {
				const done = index <= current
				const isFirst = index === 0
				const isLast = index === last

				return (
					<div key={index} className={cn(
                        'flex flex-1 flex-col items-center text-center',
                        isFirst && 'flex-[0.5] items-start',
                        isLast && 'flex-[0.5] items-end'
					)}>
						<div className={cn(
                            'relative z-10 size-4 rounded-full border-2 ring-4 ring-card transition-colors', 
                            done ? 'border-primary bg-primary' : 'border-primary/40 bg-card'
                        )} />

						<div className={cn(
                            'flex flex-col items-center text-center',
                            (isFirst || isLast) && 'w-4 whitespace-nowrap'
                        )}>
							<span className={cn('mt-3 text-[0.82rem] sm:text-sm font-medium', !done && 'text-muted-foreground')}>{title}</span>
							<span className="mt-1 text-xs whitespace-pre-line text-muted-foreground">{date}</span>
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default HorizontalTimeline
