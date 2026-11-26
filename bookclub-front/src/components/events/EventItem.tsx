import {useTranslation} from "react-i18next";
import {type Event} from '@/services/events'
import i18n from "@/utils/i18n.ts";
import {Calendar, CircleCheck} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field.tsx";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";

type OptionState = "voting" | "tie" | "won"

const localeCapitalize = (text: string, locale: string) =>
    String(text).charAt(0).toLocaleUpperCase(locale) + String(text).slice(1)

const formatDateTime = (date: string, year = false) =>
    i18n.format(new Date(date), 'datetime', i18n.language, {
        month: 'numeric',
        day: 'numeric',
        ...(year ? {year: 'numeric'} : {}),
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    })

const EventInfo = ({event}: {event: Event}) => {
    const { t } = useTranslation('pages')

    let formattedDate: string | undefined = undefined
    if (event.meetingDate) {
        const date = new Date(event.meetingDate)
        const language = i18n.language
    
        const weekday = localeCapitalize(i18n.format(date, 'datetime', language, {weekday: 'long'}), language)
        const month = localeCapitalize(i18n.format(date, 'datetime', language, {month: 'long'}), language)
        const dayTime = i18n.format(date, 'datetime', i18n.language, {
            hour12: false,
            day: 'numeric',
            hour: "2-digit",
            minute: "2-digit"
        });
        formattedDate = `${weekday}, ${month} ${dayTime}`
    }

    return (
        <div className="flex gap-2 items-start">
            <div className="flex justify-center items-center bg-accent aspect-square rounded-2xl min-w-15 overflow-hidden">
                <Calendar/>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <div className="text-muted-foreground text-xs sm:text-sm mb-1">
                    {formattedDate ?? t('club.events.list.meetingDatePending')}
                </div>
                <div title={event.title} className="font-semibold text-base line-clamp-2">
                    {event.title}
                </div>
                <div className="text-muted-foreground wrap-break-word whitespace-normal line-clamp-4 mt-2">
                    <p>{event.description}</p>
                </div>
            </div>
        </div>
    )
}

interface EventVoteProps {
    poll: {
        id: string,
        endsAt: string,
        winningOptionId?: string,
        options: {
            optionId: string,
            date: string,
            votes: number,
            votedByUser: boolean
        }[],
    }
    /* Whether the user can resolve ties */
    canResolveTies?: boolean,
    /* Called when a tie is resolved */
    onResolveTie?: (optionId: string) => void
    /* Called when checked options change */
    onChangeVotes?: (optionIds: string[]) => void
}

const EventVote = ({poll, canResolveTies = false, onResolveTie, onChangeVotes} : EventVoteProps) => {
    const {t} = useTranslation('pages')
    const {id: pollId, options, endsAt, winningOptionId} = poll
    const initialOptions = options
        .filter((value) => value.votedByUser)
        .map(option => option.optionId)

    const [selected, setSelected] = useState<string[]>(initialOptions)

    const selectOption = (optionId: string, check: boolean) => {
        setSelected(check
            ? [...selected, optionId]
            : selected.filter(id => id !== optionId)
        )
    }
    const isSelected = (optionId: string) => selected.includes(optionId)


    const voteEndDateTime = formatDateTime(poll.endsAt, true)

    const highestVotes = Math.max(...options.map(option => option.votes))
    const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)

    const tiedOptionIds = options.filter(option => option.votes === highestVotes).map(option => option.optionId)

    const hasEnded = new Date(endsAt).getTime() < Date.now()
    const hasResult = winningOptionId !== undefined
    const hasTied = tiedOptionIds.length > 1

    const showResolveTie = !hasResult && hasEnded && hasTied && canResolveTies

    const getOptionState = (optionId: string): OptionState => {
        const isTopVoted = tiedOptionIds.includes(optionId)
        if (showResolveTie && isTopVoted) return "tie"
        const isWinner = hasResult ? optionId === winningOptionId : isTopVoted
        if (hasEnded && isWinner) return "won"
        return "voting"
    }

    useEffect(() => {
        if (!hasEnded && selected !== initialOptions)
            onChangeVotes?.(selected)
    }, [selected])

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col mt-2 gap-1">
                <span className="font-bold leading-none">{t('club.events.list.vote')}</span>
                {!hasEnded &&
                    <span className="text-muted-foreground">{t('club.events.list.selectMeetingDate')}</span>
                }
            </div>

            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    {options.map(({optionId, votes, date}) => {
                        const checkboxKey = `${pollId}.${optionId}`

                        const state = getOptionState(optionId)
                        const disabled = hasEnded && state === "voting"
                        const voteProgress = highestVotes > 0 ? Math.ceil((votes / highestVotes) * 100) : 0

                        const optionDate = formatDateTime(date, false)

                        return (
                            <FieldGroup key={optionId} className="gap-3 max-w-120">

                                {/* Vote field */}
                                <Field orientation="horizontal" data-disabled={disabled}>

                                    {/* Icon or checkbox */}
                                    {state === "won" ? (
                                        <CircleCheck/>
                                    ) : state === "tie" ? (
                                        <Button onClick={() => onResolveTie?.(optionId)} size="xs">
                                            {t('club.events.list.resolve')}
                                        </Button>
                                    ) : (
                                        <Checkbox
                                            id={checkboxKey}
                                            name={checkboxKey}
                                            checked={isSelected(optionId)}
                                            onCheckedChange={isChecked => selectOption(optionId, isChecked === true)}
                                            disabled={disabled}
                                        />
                                    )}

                                    {/* Option label */}
                                    <FieldLabel htmlFor={checkboxKey} className="font-mono">{optionDate}</FieldLabel>

                                    {/* Option vote amount */}
                                    <span className="self-end text-muted-foreground">{votes}</span>
                                </Field>

                                {/* Vote progress bar */}
                                <div className="bg-accent w-full h-1.5 rounded-4xl overflow-hidden">
                                    <div className={`bg-accent-foreground h-1.5`}
                                         style={{width: voteProgress + "%"}}
                                    />
                                </div>

                            </FieldGroup>
                        )
                    })}
                    <span className="text-xs text-muted-foreground mt-1">
                        {(hasEnded ? t('club.events.list.pollEndedAt') : t('club.events.list.pollEndsAt')) + voteEndDateTime}
                    </span>
                    {totalVotes > 0 && (
                        <span className="text-muted-foreground">{t('club.events.list.votes', {votes: totalVotes})}</span>
                    )}
                </div>
            </div>
        </div>
    )
}


interface EventItemProps {
    event: Event
    /* True to hide voting being displayed. False by default */
    minimal?: boolean
    /* Whether the user viewing this is able to resolve ties (for ex. admin) */
    canResolveTies?: boolean
    /* Called when checked options change */
    onChangeVotes?: (optionIds: string[]) => void
    /* Called when a tie is resolved with the given option */
    onResolveTie?: (optionId: string) => void
    /* Called when a user has confirmed the deletion of an event */
    onDelete?: () => void
}


const EventItem = ({event, minimal = false, canResolveTies = false, onChangeVotes, onResolveTie}: EventItemProps) => {
    return (
        <div className="w-full">
            <EventInfo event={event}/>
            {!minimal && event.poll && (
                <EventVote
                    poll={{
                        id: event.poll.id,
                        endsAt: event.poll.endsAt,
                        winningOptionId: event.poll.options.find((option) => option.date === event.meetingDate)?.id,
                        options: event.poll.options.map(option => ({
                            optionId: option.id,
                            date: option.date,
                            votes: option._count.votes,
                            votedByUser: option.votes.length >= 1
                        }))
                    }}
                    canResolveTies={canResolveTies}
                    onChangeVotes={onChangeVotes}
                    onResolveTie={onResolveTie}
                />
            )}
        </div>
    )
}

export default EventItem