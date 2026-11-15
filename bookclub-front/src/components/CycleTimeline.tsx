import Timeline from './HorizontalTimeline'
import { Card, CardContent } from '@/components/ui/card'
import { type CycleWithStatus, type CyclePhase } from '@/services/cycle'
import { SectionHeader } from '@/components/SectionHeader'
import { useTranslation } from 'react-i18next'

type CycleTimelineProps = {
    bookclubId: string
    cycle: CycleWithStatus
}

type PhaseInfo = {
    title: string,
    description: string
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
    },
    phase : CyclePhase
}

const MIN_IN_MS = 60000
const HOUR_IN_MS = 60 * MIN_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

const phases: Record<CyclePhase, PhaseInfo> = {
        proposal: {
            title: 'Suggest Books',
            description: 'Suggest which book should be read next'
        },
        voting: {
            title: 'Vote Books',
            description: 'Vote which books you\'d like to read'
        },
        over: {
            title: 'Results',
            description: 'Check the results of the vote'
        }
    }

const getCycleData = (cycle: CycleWithStatus): CycleData | null => {
    if (!cycle.createdAt || !cycle.proposalEnd || !cycle.votingEnd || !cycle.phase) return null

    const dates = {
        suggest: new Date(cycle.createdAt),
        voting: new Date(cycle.proposalEnd),
        results: new Date(cycle.votingEnd)
    }

    const calcDays = (from: Date, to: Date) =>
        Math.ceil((to.getTime() - from.getTime()) / DAY_IN_MS) - 1

    const days = {
        current: calcDays(dates.suggest, new Date()),
        voting: calcDays(dates.suggest, dates.voting),
        total: calcDays(dates.suggest, dates.results)
    }
    const phase = cycle.phase

    return { days, dates, phase }
}

const getProgressPosition = (ratio: number) => `calc(0.7px + (100% - 1.4px) * ${ratio})`
const formatDate = (date: Date, language: string) =>
    date.toLocaleDateString(language, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    })

const getTime = (currentDate: Date, goalDate: Date) => {
    const currentTime = goalDate.getTime() - currentDate.getTime()

    if (currentTime <= 0) return { time: 0, timeUnit: 'minute' }

    const timeInfo = currentTime >= DAY_IN_MS 
        ? { time: Math.floor(currentTime / DAY_IN_MS), timeUnit: 'day' }
        : currentTime >= HOUR_IN_MS
            ? { time: Math.floor((currentTime / HOUR_IN_MS) % 24), timeUnit: 'hour' }
            : { time: Math.floor((currentTime / MIN_IN_MS) % 60), timeUnit: 'minute' }

    return timeInfo
}

const getUnit = (locale: string, unit: string, value: number) => {
    return new Intl.NumberFormat(locale, {style: 'unit', unit, unitDisplay: 'long'})
        .formatToParts(value)
        .find(part => part.type === 'unit')?.value ?? unit
}

export const CycleTimeline = ({ cycle }: CycleTimelineProps) => {
    const { i18n } = useTranslation()

    const timeline = getCycleData(cycle)
    if (!timeline) return null

    const { days, dates, phase } = timeline
    const language = i18n.resolvedLanguage ?? i18n.language
    const progress = Math.min(100, Math.max(0, (days.current / days.total) * 100))
    const goalDate = phase === 'proposal' ? dates.voting : dates.results
    const { time, timeUnit } = getTime(new Date(Date.now()), goalDate)
    const unitLabel = getUnit(language, timeUnit, time)
    const nextPhase = phase === 'proposal' ? 'Voting' : 'Results'
    const phaseNumber = cycle.phase === 'proposal' ? 0 : cycle.phase === 'voting' ? 1 : 2

    const cycleProgression = [
        {
            title: "Suggestions",
            date: `${dates.suggest.toLocaleDateString()}\n${dates.suggest.toLocaleTimeString(
                [],
                { hour: '2-digit', minute: '2-digit' }
            )}`
        },
        {
            title: "Voting",
            date: `${dates.voting.toLocaleDateString()}\n${dates.voting.toLocaleTimeString(
                [],
                { hour: '2-digit', minute: '2-digit' }
            )}`
        },
        {
            title: "Results",
            date: `${dates.results.toLocaleDateString()}\n${dates.results.toLocaleTimeString(
                [],
                { hour: '2-digit', minute: '2-digit' }
            )}`
        },
    ]

    return (
        <Card className='mb-6 border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur'>
            <SectionHeader title='Current Cycle'/>
            <CardContent>
                <div className='flex w-full flex-col gap-4 sm:flex-row justify-normal sm:justify-between mb-6 rounded-3xl bg-accent'>
                    <div className='flex flex-col flex-wrap pt-4 sm:py-4 px-6'>
                        <span className='break-words'>Current Phase</span>
                        <span className='break-words font-heading text-2xl sm:text-3xl mb-3 mt-1 font-medium text-primary-contrast'>{phases[phase].title}</span>
                        <span className='break-words text-muted-foreground'>{phases[phase].description}</span>
                    </div>
                    
                    <hr className='inline sm:hidden border-secondary' />

                    {phase !== 'over' && (
                        <div className='flex flex-col flex-wrap items-start sm:items-end pb-4 sm:py-4 px-6'>
                            <span className='break-words'>Time Left</span>
                            <div className='flex items-baseline gap-2 mb-3'>
                                <span className='break-words font-heading text-3xl sm:text-4xl font-medium text-primary-contrast'>{time}</span>
                                <span className='break-words font-heading text-2xl sm:text-3xl font-medium text-primary-contrast capitalize'>{unitLabel}</span>
                            </div>
                            <span className='break-words text-muted-foreground'>Next phase: {nextPhase}</span>
                        </div>
                    )}
                </div>

                <div className='px-10 pt-2'>
                    <Timeline steps={cycleProgression} current={phaseNumber} />
                </div>
            </CardContent>
        </Card>
    )
} 