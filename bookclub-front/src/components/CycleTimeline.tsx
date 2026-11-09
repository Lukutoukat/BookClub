import { type CycleWithStatus, type CyclePhase } from '@/services/cycle'
import { Card, CardContent } from './ui/card'
import { SectionHeader } from './SectionHeader'
import { Progress } from './ui/progress'
import { useTranslation } from 'react-i18next'

type CycleTimelineProps = {
	bookclubId: string
    cycle: CycleWithStatus
}

type CycleData = {
	days: {
		current: number
		voting: number
		total: number
	}
	dates: {
		suggest: Date
		voting: Date
		results: Date
	}
}

const msPerDay = 1000 * 60 * 60 * 24
const phases: Record<CyclePhase, string> = {
        proposal: 'Suggest',
        voting: 'Voting',
        over: 'Results'
    }

const getCycleData = (cycle: CycleWithStatus): CycleData | null => {
	if (!cycle.createdAt || !cycle.proposalEnd || !cycle.votingEnd) return null

	const dates = {
		suggest: new Date(cycle.createdAt),
		voting: new Date(cycle.proposalEnd),
		results: new Date(cycle.votingEnd)
	}

	const calcDays = (from: Date, to: Date) =>
		Math.ceil((to.getTime() - from.getTime()) / msPerDay) - 1

    const days = {
        current: calcDays(dates.suggest, new Date()),
        voting: calcDays(dates.suggest, dates.voting),
        total: calcDays(dates.suggest, dates.results)
    }

	return { days, dates }
}

const getProgressPosition = (ratio: number) => `calc(0.7px + (100% - 1.4px) * ${ratio})`
const formatDate = (date: Date, language: string) =>
	date.toLocaleDateString(language, {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric'
	})

export const CycleTimeline = ({ cycle }: CycleTimelineProps) => {
	const { i18n } = useTranslation()

	const timeline = getCycleData(cycle)
	if (!timeline) return null

	const { days, dates } = timeline
	const language = i18n.resolvedLanguage ?? i18n.language
	const progress = (days.current / days.total) * 100
    
    return (
        <>
            <Card className='gap-4 border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur'>
                <SectionHeader title='Current Cycle'/>
                <CardContent>
                    <div className='flex flex-col text-lg mb-6'>
                        <div className='w-full rounded-3xl p-6 bg-accent'>
                            <div className='flex flex-row flex-wrap justify-between gap-x-6 gap-y-4 pb-2'>
                                {/* Chunk 1: Current Phase */}
                                <div className='flex max-w-full flex-col items-start'>
                                    <span className='sm:text-base text-sm'>Current Phase</span>
                                    <span className='text-2xl sm:text-3xl break-words font-bold text-primary'>
                                    {cycle.phase ? phases[cycle.phase] : 'Unknown'}
                                    </span>
                                </div>

                                {/* Chunk 2: Days left */}
                                <div className='sm:ml-auto flex max-w-full flex-col items-end text-right'>
                                    <span className='sm:text-base text-sm'>Days left</span>
                                    <span className='text-2xl sm:text-3xl font-bold text-primary'>
                                    {days.voting - days.current}
                                    </span>
                                </div>
                            </div>
                            {/* <hr />
                            <div className='flex flex-row justify-between'>
                                <div>
                                    <span className='text-base'>Next Phase</span>
                                    <br />
                                    <span className='text-3xl font-bold mb-10'>
                                        {cycle.phase
                                            ? cycle.phase === 'proposal'
                                                ? phases['voting']
                                                : phases['over']
                                            : 'Unknown'
                                        }
                                    </span>
                                </div>
                                <div>
                                    <span>starts on</span>
                                    <br />
                                    <span>{formattedDate(dates.votingDate)}</span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                    
                    <div className='w-full flex flex-col pl-2 pr-2 pb-0 pt-2'>
                        <div className='flex relative h-7 sm:h-10 text-xs sm:text-sm translate-y-2' aria-label='labels'>
                            <div className='start absolute left-0 -top-6 bottom-0 flex flex-col items-start'>
                                <span className='text-left whitespace-pre-line -translate-x-1'>{`${phases['proposal']}\n${formatDate(dates.suggest, language)}`}</span>
                                <span className='flex-1 border-l-2 border-primary' />
                            </div>
                            {/* {false && (
                                <div 
                                    className={`middle absolute -top-6 bottom-0 flex flex-col items-center -translate-x-1/2`}
                                    style={{ left: barLeft(days.voting / days.total) }}
                                >
                                    <span className='text-center whitespace-pre-line'>{`${middleLabel}\n${formattedDate(dates.votingDate)}`}</span>
                                    <span className='flex-1 border-l-2 border-gray-400' />
                                </div>
                            )} */}
                            <div className='end absolute right-0 -top-6 bottom-0 flex flex-col items-end'>
                                <span className='text-right whitespace-pre-line translate-x-1'>{`${phases['voting']}\n${formatDate(dates.results, language)}`}</span>
                                <span className='flex-1 border-l-2 border-primary' />
                            </div>
                        </div>

                        <Progress 
                            value={progress}
                            className='border-2 border-primary h-4 z-2'
                            title={`${Math.ceil(progress)}%`}
                        />

                        <div className='flex relative h-14 sm:h-17 text-xs sm:text-sm -translate-y-2'>
                            <div 
                                className={`middle absolute top-0 bottom-0 flex flex-col items-center -translate-x-1/2`}
                                style={{ left: getProgressPosition(days.voting / days.total) }}
                            >
                                <span className='flex-1 border-l-2 border-primary' />
                                <span className='text-center whitespace-pre-line'>{`${phases['over']}\n${formatDate(dates.voting, language)}`}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <br />
        </>
    )
} 
