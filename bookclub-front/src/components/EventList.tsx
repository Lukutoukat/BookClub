import  { useEffect, useState } from 'react'
import eventService, { type Event } from '@/services/events'
import { Card, CardContent } from '@/components/ui/card'
interface EventListProps {
    bookclubId: string
}

const EventList = ({ bookclubId }: EventListProps) => {
    const [events, setEvents] = useState<Event[]>([])

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventService.getAll(bookclubId)
                setEvents(data)
            } catch (error) {
                console.error('Error fetching events:', error)
            }
        }

        void fetchEvents()
    }, [bookclubId])

    return (
        <div className="space-y-4">
            {events.length === 0 ? (
                <p>No events found.</p>
            ) : (
                events.map((event) => (
                    <Card key={event.id}>
                        <CardContent>
                            <h3 className="font-semibold">{event.title}</h3>
                            {event.description && (<p>{event.description}</p>)}
                            {event.meetingDate ? (
                                <p>{new Date(event.meetingDate).toLocaleDateString()}</p>
                            ) : (
                                <p>No meeting date set.</p>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}

export default EventList