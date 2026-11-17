import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import eventService from '@/services/events'
import { useNotification } from '@/context/NotificationContext'
import { getErrorMessage } from '@/lib/errorMessage'
import { useTranslation } from 'react-i18next'

interface CreateEventProps {
    bookclubId: string,
    onCreated: () => void
}

const CreateEvent = ({ bookclubId, onCreated }: CreateEventProps) => {
    const { t } = useTranslation('pages')
    const { showError, showSuccess } = useNotification()
    const [ title, setTitle ] = useState('')
    const [ description, setDescription ] = useState('')
    const [ meetingDate, setMeetingDate ] = useState('')
    const [ isPoll, setIsPoll ] = useState(false)
    const [ pollOptions, setPollOptions ] = useState<string[]>(['', ''])
    const [ pollEndsAt, setPollEndsAt ] = useState('')
    
    const isPollEndValid = pollEndsAt !== '' && new Date(pollEndsAt).getTime() > Date.now()
    const arePollOptionsValid = pollOptions.every(option => option !== '' && new Date(option).getTime() > new Date(pollEndsAt).getTime())
    const isPollEndInPast = pollEndsAt !== '' && new Date(pollEndsAt).getTime() <= Date.now()
    const hasInvalidPollDates = pollEndsAt !== '' && 
        pollOptions.some(option => 
            option !== '' && 
            new Date(option).getTime() <= new Date(pollEndsAt).getTime()
        )

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
            showSuccess(t('club.events.create.success'))
            onCreated()

        } catch (error) {
            showError(getErrorMessage(error))
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold">{t('club.events.create.title')}</h3>
            <div className="space-y-2">
                <Label htmlFor="event-title">{t('club.events.create.name')}</Label>
                <Input
                    id="event-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('club.events.create.namePlaceholder')}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="event-description">{t('club.events.create.description')}</Label>
                <Textarea
                    id="event-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('club.events.create.descriptionPlaceholder')}
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
                <Label htmlFor="event-poll">{t('club.events.create.createPoll')}</Label>
            </div>
            {!isPoll && (
                <div className="space-y-2">
                    <Label htmlFor="event-date">{t('club.events.create.meetingDate')}</Label>
                    <Input
                        id="event-date"
                        type="datetime-local"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        placeholder={t('club.events.create.selectDate')}
                    />
                </div>
            )}
            {isPoll && (
                <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                        <div key={index} className="space-y-2">
                            <Label> {t('club.events.create.option', { number: index + 1 })} </Label>
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
                                        aria-label={t('club.events.create.removeOption')}
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
                        <Label htmlFor="poll-ends-at">{t('club.events.create.pollEndsAt')}</Label>
                        <Input
                            id="poll-ends-at"
                            type="datetime-local"
                            value={pollEndsAt}
                            onChange={(e) => setPollEndsAt(e.target.value)}
                            placeholder={t('club.events.create.selectDate')}
                        />
                        {isPollEndInPast && (
                            <p className="text-sm text-destructive" role="alert">{t('club.events.create.pollEndInPast')}</p>
                        )}
                        {hasInvalidPollDates && (
                            <p className="text-sm text-destructive" role="alert">{t('club.events.create.invalidPollDates')}</p>
                        )}
                    </div>
                    <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        aria-label={t('club.events.create.addOption')}
                    >
                        <span className="text-xl font-bold">+</span>
                    </Button>
                    </div>
                </div>
            )}
            <Button onClick={handleCreate} 
                    disabled={!title.trim() ||
                    (isPoll ? !isPollEndValid || !arePollOptionsValid : !meetingDate)}>
                {t('club.events.create.title')}
            </Button>
        </div>
    )
}

export default CreateEvent