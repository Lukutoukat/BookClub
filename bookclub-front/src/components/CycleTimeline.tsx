    import { type CycleWithStatus, type CyclePhase } from '@/services/cycle'
    import { Card, CardContent } from './ui/card'
    import { SectionHeader } from './SectionHeader'
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

    const msPerDay = 1000 * 60 * 60 * 24
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
            Math.ceil((to.getTime() - from.getTime()) / msPerDay) - 1

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
        const MIN_IN_MS = 60000
        const HOUR_IN_MS = 60 * MIN_IN_MS
        const DAY_IN_MS = 24 * HOUR_IN_MS
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

        return (
            <Card className='mb-6 border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur'>
                <SectionHeader title='Current Cycle'/>
                <CardContent>
                    <div className='flex w-full flex-col gap-4 sm:flex-row justify-normal sm:justify-between p-4 mb-6 rounded-3xl bg-accent'>
                        <div className='flex flex-col flex-wrap pl-2 pr-2'>
                            <span className='break-words'>Current Phase</span>
                            <span className='break-words font-heading text-2xl sm:text-3xl mb-3 mt-1 font-medium text-primary'>{phases[phase].title}</span>
                            <span className='break-words text-muted-foreground'>{phases[phase].description}</span>
                        </div>
                        
                        <hr className='inline sm:hidden border-primary' />

                        {phase !== 'over' && (
                            <div className='flex flex-col flex-wrap items-start sm:items-end pl-2 pr-2'>
                                <span className='break-words'>Time Left</span>
                                <div className='flex items-baseline gap-2 mb-3'>
                                    <span className='break-words font-heading text-3xl sm:text-4xl font-medium text-primary'>{time}</span>
                                    <span className='break-words font-heading text-2xl sm:text-3xl font-medium text-primary capitalize'>{unitLabel}</span>
                                </div>
                                <span className='break-words text-muted-foreground'>Next phase: {nextPhase}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    } 