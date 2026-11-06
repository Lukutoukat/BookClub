import  { useEffect, useState } from 'react'
import eventService, { type Event } from '@/services/events'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import CreateEvent from '@/components/CreateEvent'

interface EventListProps {
    bookclubId: string
    isAdmin: boolean
}

const EventList = ({ bookclubId, isAdmin }: EventListProps) => {
    const [events, setEvents] = useState<Event[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})

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
                console.error('Error fetching events:', error)
            }
        }
    const renderMeetingDate = (event: Event) => {
        if (event.meetingDate) {
            return <p>Tapaamisen ajankohta: {new Date(event.meetingDate).toLocaleString()}</p>
        } else {
            return <p>Tapaamisen ajankohtaa ei ole vielä päätetty.</p>
        }
    }

    const handleVote = async (pollId: string) => {
        try {
            console.log('Selected options for poll:', selectedOptions[pollId])
            await eventService.vote(pollId, selectedOptions[pollId] || [])
            await fetchEvents()
        } catch (error) {
            console.error('Error saving votes:', error)
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
                            <Button> Luo tapahtuma</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Luo tapahtuma</DialogTitle>
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
                <p>No events found.</p>
            ) : (
                events.map((event) => (
                    <Card key={event.id}>
                        <CardContent>
                            <h3 className="font-semibold">{event.title}</h3>
                            {event.description && (<p>{event.description}</p>)}
                            {event.poll && (
                                <div className="space-y-2">
                                    <p>Äänestys päättyy: {new Date(event.poll.endsAt).toLocaleString()}</p>

                                    {event.poll.options.map((option) => (
                                        <div key={option.id}>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOptions[event.poll!.id]?.includes(option.id) || false}
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
                                                {new Date(option.date).toLocaleString()}
                                            </label>
                                            <p>Äänet: {option._count.votes}</p>
                                        </div>
                                    ))}
                                    <Button onClick={() => handleVote(event.poll!.id)}>Tallenna äänet</Button>
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