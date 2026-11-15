import HorizontalTimeline from './HorizontalTimeline'
import { Card, CardContent } from '@/components/ui/card'
import { type CycleWithStatus, type CyclePhase } from '@/services/cycle'
import { SectionHeader } from '@/components/SectionHeader'
import { useTranslation } from 'react-i18next'

type CycleTimelineProps = {
    cycle: CycleWithStatus
}

type PhaseInfo = {
    title: string,
    description: string
}

type CycleData = {
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
const PHASE_ORDER: CyclePhase[] = ['proposal', 'voting', 'over']

const phaseLabels: Record<CyclePhase, PhaseInfo> = {
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
    
    const phase = cycle.phase

    return { dates, phase }
}

const getTime = (now: Date, goal: Date) => {
    const currentTime = goal.getTime() - now.getTime()
    if (currentTime >= DAY_IN_MS) return { time: Math.floor(currentTime / DAY_IN_MS), timeUnit: 'day' }
    if (currentTime >= HOUR_IN_MS) return { time: Math.floor(currentTime / HOUR_IN_MS), timeUnit: 'hour' }
    return { time: Math.max(0, Math.floor(currentTime / MIN_IN_MS)), timeUnit: 'minute' }
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

    const { dates, phase } = timeline
    const language = i18n.resolvedLanguage ?? i18n.language
    const goalDate = phase === 'proposal' ? dates.voting : dates.results
    const { time, timeUnit } = getTime(new Date(), goalDate)
    const unitLabel = getUnit(language, timeUnit, time)
    const nextPhase = phase === 'proposal' ? 'Voting' : 'Results'
    const phaseNumber = PHASE_ORDER.indexOf(phase)

    const formatDateTime = (date: Date) =>
        `${date.toLocaleDateString()}\n${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    const cycleProgression = [
        { title: 'Suggestions', date: formatDateTime(dates.suggest) },
        { title: 'Voting', date: formatDateTime(dates.voting) },
        { title: 'Results', date: formatDateTime(dates.results) },
    ]

    return (
        <Card className='mb-6 border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur'>
            <SectionHeader title='Current Cycle'/>
            <CardContent>
                <div className='flex w-full flex-col gap-4 sm:flex-row justify-normal sm:justify-between mb-6 rounded-3xl bg-accent'>
                    <div className='flex flex-col flex-wrap pt-4 sm:py-4 px-6'>
                        <span className='break-words'>Current Phase</span>
                        <span className='break-words font-heading text-2xl sm:text-3xl mb-3 mt-1 font-medium text-primary-contrast'>{phaseLabels[phase].title}</span>
                        <span className='break-words text-muted-foreground'>{phaseLabels[phase].description}</span>
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
                    <HorizontalTimeline steps={cycleProgression} current={phaseNumber} />
                </div>
            </CardContent>
        </Card>
    )
}
