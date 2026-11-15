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
    const { t, i18n } = useTranslation('pages')

    const timeline = getCycleData(cycle)
    if (!timeline) return null

    const { dates, phase } = timeline
    const language = i18n.resolvedLanguage ?? i18n.language
    const goalDate = phase === 'proposal' ? dates.voting : dates.results
    const { time, timeUnit } = getTime(new Date(), goalDate)
    const unitLabel = getUnit(language, timeUnit, time)
    const nextPhase = phase === 'proposal' ? t('club.cycle.info.voting.name') : t('club.cycle.info.over.name')
    const phaseNumber = PHASE_ORDER.indexOf(phase)

    const formatDateTime = (date: Date) =>
        `${date.toLocaleDateString()}\n${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    const cycleProgression = [
        { title: t('club.cycle.info.proposal.name'), date: formatDateTime(dates.suggest) },
        { title: t('club.cycle.info.voting.name'), date: formatDateTime(dates.voting) },
        { title: t('club.cycle.info.over.name'), date: formatDateTime(dates.results) },
    ]

    return (
        <Card className='mb-6 border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur'>
            <SectionHeader title={t('club.cycle.info.title')} />
            <CardContent className='px-4'>
                <div className='flex w-full flex-col sm:flex-row justify-normal sm:justify-between mb-6 rounded-3xl bg-accent'>
                    <div className='flex flex-col flex-wrap pt-4 pb-2 sm:py-4 px-6'>
                        <span className='break-words'>{t('club.cycle.info.phaseTitle')}</span>
                        <span className='break-words font-heading text-xl sm:text-2xl mb-2 mt-1 font-medium text-primary-contrast'>{t(`club.cycle.info.${phase}.title`)}</span>
                        <span className='break-words text-muted-foreground'>{t(`club.cycle.info.${phase}.description`)}</span>
                    </div>

                    {phase !== 'over' && (
                        <>
                        <div className='inline sm:hidden border-b-2 border-secondary' />

                        <div className='flex flex-col flex-wrap items-start sm:items-end pt-2 pb-4 sm:py-4 px-6'>
                            <span className='break-words'>{t('club.cycle.info.timeLeft')}</span>
                            <div className='flex items-baseline gap-2 mb-2'>
                                <span className='break-words font-heading text-2xl sm:text-3xl font-medium text-primary-contrast'>{time}</span>
                                <span className='break-words font-heading text-xl sm:text-2xl font-medium text-primary-contrast'>{unitLabel}</span>
                            </div>
                            <span className='break-words text-muted-foreground sm:text-right'>{t('club.cycle.info.nextPhase', { phase: nextPhase })}</span>
                        </div>
                        </>
                    )}
                </div>

                <div className='overflow-x-auto pt-2'>
                    <div className='min-w-[15rem] px-12'>
                        <HorizontalTimeline steps={cycleProgression} current={phaseNumber} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
