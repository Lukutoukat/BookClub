import  { useEffect, useState } from 'react'
import eventService, { type Event } from '@/services/events'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import CreateEvent from '@/components/CreateEvent'
import { useNotification } from '@/context/NotificationContext'
import { getErrorMessage } from '@/lib/errorMessage'
import { useTranslation } from 'react-i18next'

interface EventListProps {
    bookclubId: string
    isAdmin: boolean
    onVoteSaved?: () => void
}

const EventList = ({ bookclubId, isAdmin, onVoteSaved }: EventListProps) => {
    const { t, i18n } = useTranslation('pages')
    const [events, setEvents] = useState<Event[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
    const { showSuccess, showError } = useNotification()

    const fetchEvents = async () => {
            try {
                const data = await eventService.getAll(bookclubId)
                const savedSelections: Record<string, string[]> = {}
                data.forEach(event => {
                    if (event.poll) {
                        savedSelections[event.poll.id] = event.poll.options.filter(option => option.votes.length > 0).map(option => option.id)
                    }
                })
                setSelectedOptions(savedSelections)
                setEvents(data)
            } catch (error) {
                showError(getErrorMessage(error))
            }
        }
    
    const renderMeetingDate = (event: Event) => {
        if (event.meetingDate) {
            return <p>{t('club.events.list.meetingDate')} {new Date(event.meetingDate).toLocaleString(i18n.language)}</p>
        } else {
            return <p>{t('club.events.list.meetingDatePending')}</p>
        }
    }

    const renderPollEndDate = (endsAt: string) => {
        if (new Date(endsAt).getTime() <= Date.now()) {
            return <p>{t('club.events.list.pollEndedAt')} {new Date(endsAt).toLocaleString(i18n.language)}</p>
        } else {
            return <p>{t('club.events.list.pollEndsAt')} {new Date(endsAt).toLocaleString(i18n.language)}</p>
        }
    }

    const handleVote = async (pollId: string) => {
        try {
            await eventService.vote(pollId, selectedOptions[pollId] || [])
            await fetchEvents()
            onVoteSaved?.()
            showSuccess(t('club.events.list.voteSuccess'))
        } catch (error) {
            showError(getErrorMessage(error))
        }
    }

    const handleResolvePoll = async (pollId: string, optionId: string) => {
        try {
            await eventService.resolvePoll(pollId, optionId)
            await fetchEvents()
            showSuccess(t('club.events.list.resolveSuccess'))
        } catch (error) {
            showError(getErrorMessage(error))
        }
    }

    const isPollTied = (event: Event) => {
        if (!event.poll || event.meetingDate) {
            return false
        }

        if (new Date(event.poll.endsAt).getTime() > Date.now()) {
            return false
        }

        const maxVotes = Math.max(...event.poll.options.map(option => option._count.votes))
        if (maxVotes === 0) {
            return false
        }

        const tiedOptions = event.poll.options.filter(option => option._count.votes === maxVotes)
        if (tiedOptions.length > 1) {
            return true
        } else {
            return false
        }
    }

    const hasPollNoVotes = (event: Event) => {
        if (!event.poll || event.meetingDate) {
            return false
        }

        if (new Date(event.poll.endsAt).getTime() > Date.now()) {
            return false
        }

        const totalVotes = event.poll.options.reduce((sum, option) => sum + option._count.votes, 0)
        if (totalVotes === 0) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        void fetchEvents()

    }, [bookclubId])

    return (
        <div className="space-y-4">
            {isAdmin && (
                <div className="flex justify-end">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button> {t('club.events.create.title')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('club.events.create.title')}</DialogTitle>
                                <DialogDescription>{t('club.events.create.dialogDescription')}</DialogDescription>
                            </DialogHeader>
                            <CreateEvent bookclubId={bookclubId} onCreated={() => {
                                setDialogOpen(false)
                                void fetchEvents()
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {events.length === 0 ? (
                <p>{t('club.events.list.empty')}</p>
            ) : (
                events.map((event) => (
                    <Card key={event.id}>
                        <CardContent>
                            <h3 className="font-semibold">{event.title}</h3>
                            {event.description && (<p>{event.description}</p>)}
                            {event.poll && (
                                <div className="space-y-2">
                                    {renderPollEndDate(event.poll.endsAt)}
                                    {new Date(event.poll.endsAt).getTime() <= Date.now() && (
                                        <p>{t('club.events.list.pollEnded')}</p>
                                    )}

                                    {event.poll.options.map((option) => (
                                        <div key={option.id}>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOptions[event.poll!.id]?.includes(option.id) || false}
                                                    disabled={new Date(event.poll!.endsAt).getTime() <= Date.now()}
                                                    onChange={(e) => {
                                                        const current = selectedOptions[event.poll!.id] || []
                                                        if (e.target.checked) {
                                                            setSelectedOptions({
                                                                ...selectedOptions,
                                                                [event.poll!.id]: [...current, option.id]
                                                            })
                                                        } else {
                                                            setSelectedOptions({
                                                                ...selectedOptions,
                                                                [event.poll!.id]: current.filter(id => id !== option.id)
                                                            })
                                                        }
                                                    }}
                                                />
                                                {new Date(option.date).toLocaleString(i18n.language)}
                                            </label>
                                            <p>{t('club.events.list.votes')}: {option._count.votes}</p>
                                        </div>
                                    ))}
                                    <Button onClick={() => handleVote(event.poll!.id)} disabled={new Date(event.poll.endsAt).getTime() <= Date.now()}>
                                        {t('club.events.list.saveVotes')}
                                    </Button>
                                </div>
                            )}
                            {isPollTied(event) && (
                                <div className="space-y-2">
                                    <p>{t('club.events.list.pollTied')}</p>

                                    {isAdmin && event.poll && (
                                        <div className="space-y-2">
                                            <p>{t('club.events.list.selectMeetingDate')}:</p>

                                            {event.poll.options.filter(option => {
                                                const maxVotes = Math.max(...event.poll!.options.map(o => o._count.votes))
                                                return option._count.votes === maxVotes
                                            }).map(option => (
                                                <Button key={option.id} variant="outline" onClick={() => handleResolvePoll(event.poll!.id, option.id)}>
                                                    {new Date(option.date).toLocaleString(i18n.language)}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {hasPollNoVotes(event) && (
                                <div className="space-y-2">
                                    <p>{t('club.events.list.pollNoVotes')}</p>
                                    {isAdmin && event.poll && (
                                        <div className="space-y-2">
                                            <p>{t('club.events.list.selectMeetingDate')}:</p>
                                            {event.poll.options.map(option => (
                                                <Button key={option.id} variant="outline" onClick={() => handleResolvePoll(event.poll!.id, option.id)}>
                                                    {new Date(option.date).toLocaleString(i18n.language)}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {renderMeetingDate(event)}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}

export default EventList