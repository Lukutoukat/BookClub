import  { useEffect, useState } from 'react'
import eventService, { type Event } from '@/services/events'

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
        <div>
            {events.length === 0 ? (
                <p>No events found.</p>
            ) : (
                events.map((event) => (
                    <p key={event.id}>{event.title}</p>
                ))
            )}
        </div>
    )
}

export default EventList