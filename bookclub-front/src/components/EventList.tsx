import  { useEffect, useState } from 'react'
import eventService, { type Event } from '@/services/events'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import CreateEvent from '@/components/CreateEvent'
import { useNotification } from '@/context/NotificationContext'
import { getErrorMessage } from '@/lib/errorMessage'
import { useTranslation } from 'react-i18next'
import EventItem from "@/components/events/EventItem.tsx";
import {Card} from "@/components/ui/card.tsx";
import {ButtonDialog} from "@/components/ButtonDialog.tsx";
import {Trash2} from "lucide-react";

interface EventListProps {
    bookclubId: string
    isAdmin: boolean
    onVoteSaved?: () => void
}

const EventList = ({ bookclubId, isAdmin, onVoteSaved }: EventListProps) => {
    const { t } = useTranslation('pages')
    const [events, setEvents] = useState<Event[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const { showSuccess, showError } = useNotification()

    const fetchEvents = async () => {
        try {
            const data = await eventService.getAll(bookclubId)
            setEvents(data)
        } catch (error) {
            showError(getErrorMessage(error))
        }
    }

    const handleDelete = async (eventId: string) => {
        try {
            await eventService.remove(eventId)
            await fetchEvents()
            onVoteSaved?.()
            showSuccess(t('club.events.delete.success'))
        } catch (error) {
            showError(getErrorMessage(error))
        }
    }

    const handleVote = async (pollId: string, optionIds: string[]) => {
        try {
            await eventService.vote(pollId, optionIds)
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
                        <DialogContent className='max-h-[calc(100vh-2rem)] overflow-auto'>
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
                <div className="flex flex-col gap-4">
                    {events.map((event) => {
                        const pollId = event.poll?.id
                        return (
                            <Card className="p-6" key={event.id}>
                                <div className="flex flex-wrap sm:flex-nowrap">
                                    <EventItem
                                        event={event}
                                        canResolveTies={isAdmin}
                                        onChangeVotes={optionIds => {
                                            if (pollId)
                                                void handleVote(pollId, optionIds)
                                        }}
                                        onResolveTie={optionId => {
                                            if (pollId)
                                                void handleResolvePoll(pollId, optionId)
                                        }}
                                    />

                                    {/* Event controls */}
                                    {isAdmin && (
                                        <div className="mt-3 sm:mt-0">
                                            <ButtonDialog
                                                buttonText={t('actions.delete', {ns: 'common'})}
                                                buttonTitle={t('actions.delete', {ns: 'common'})}
                                                buttonVariant="dangerous"
                                                buttonClassName="text-destructive hover:text-destructive/80"
                                                alertDialogText={t('club.events.delete.confirm', {name: event.title})}
                                                alertDialogDescription={t('club.events.delete.warning')}
                                                alertDialogContinueText={t('actions.delete', {ns: 'common'})}
                                                buttonOnClick={() => void handleDelete(event.id)}
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </ButtonDialog>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default EventList