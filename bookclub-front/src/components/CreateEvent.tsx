import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import eventService from '@/services/events'
import axios from 'axios'

interface CreateEventProps {
    bookclubId: string,
    onCreated: () => void
}

const CreateEvent = ({ bookclubId, onCreated }: CreateEventProps) => {
    const [ title, setTitle ] = useState('')
    const [ description, setDescription ] = useState('')
    const [ meetingDate, setMeetingDate ] = useState('')
    const [ isPoll, setIsPoll ] = useState(false)
    const [ pollOptions, setPollOptions ] = useState<string[]>(['', ''])
    const [ pollEndsAt, setPollEndsAt ] = useState('')
    
    const isPollEndValid = pollEndsAt !== '' && new Date(pollEndsAt).getTime() > Date.now()
    const arePollOptionsValid = pollOptions.every(option => option !== '' && new Date(option).getTime() > new Date(pollEndsAt).getTime())

    const handleCreate = async () => {
        try {
            if (isPoll) {
                await eventService.create({
                    bookclub_id: bookclubId,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    poll: {
                        endsAt: new Date(pollEndsAt).toISOString(),
                        dates: pollOptions.map(option => new Date(option).toISOString())
                    }
                })
            } else {
                await eventService.create({
                    bookclub_id: bookclubId,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    meetingDate: new Date(meetingDate).toISOString()
                })
            }

            setTitle('')
            setDescription('')
            setMeetingDate('')
            setIsPoll(false)
            setPollOptions(['', ''])
            setPollEndsAt('')
            onCreated()

        } catch (error) {
            console.error('Error creating event:', error)
            
            if (axios.isAxiosError(error)) {
                console.log('Backend error:', error.response?.data)
            }
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Luo tapahtuma</h3>
            <div className="space-y-2">
                <Label htmlFor="event-title">Tapahtuman nimi</Label>
                <Input
                    id="event-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Esim: Marraskuun lukupiiri"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="event-description">Kuvaus</Label>
                <Textarea
                    id="event-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tapahtuman kuvaus..."
                />
            </div>
            <div className="flex items-center space-x-2">
                <Input
                    id="event-poll"
                    type="checkbox"
                    checked={isPoll}
                    onChange={(e) => setIsPoll(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                />
                <Label htmlFor="event-poll">Luo päivämäärä-äänestys</Label>
            </div>
            {!isPoll && (
                <div className="space-y-2">
                    <Label htmlFor="event-date">Tapahtuman ajankohta</Label>
                    <Input
                        id="event-date"
                        type="datetime-local"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        placeholder="Valitse ajankohta"
                    />
                </div>
            )}
            {isPoll && (
                <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                        <div key={index} className="space-y-2">
                            <Label> Vaihtoehto {index + 1} </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="datetime-local"
                                    value={option}
                                    onChange={(e) => {
                                        const updatedOptions = [...pollOptions]
                                        updatedOptions[index] = e.target.value
                                        setPollOptions(updatedOptions)
                                    }}
                                />
                                {pollOptions.length > 2 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        aria-label="Poista vaihtoehto"
                                        onClick={() => {
                                            setPollOptions(pollOptions.filter((_, i) => i !== index))
                                        }}
                                    >
                                        <span className="text-xl font-bold">-</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="space-y-2">
                        <Label htmlFor="poll-ends-at">Äänestyksen päättymisaika</Label>
                        <Input
                            id="poll-ends-at"
                            type="datetime-local"
                            value={pollEndsAt}
                            onChange={(e) => setPollEndsAt(e.target.value)}
                            placeholder="Valitse päättymisaika"
                        />
                    </div>
                    <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        aria-label="Lisää vaihtoehto"
                    >
                        <span className="text-xl font-bold">+</span>
                    </Button>
                    </div>
                </div>
            )}
            <Button onClick={handleCreate} 
                    disabled={!title.trim() ||
                    (isPoll ? !isPollEndValid || !arePollOptionsValid : !meetingDate)}>
                Luo tapahtuma
            </Button>
        </div>
    )
}

export default CreateEvent