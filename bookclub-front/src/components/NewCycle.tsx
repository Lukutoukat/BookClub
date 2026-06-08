import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays } from 'date-fns'
import { PageHeader } from '../components/PageHeader'
import { Button } from './ui/button'
import { RangeCalendarComponent } from './RangeCalendarComponent'
import { type DateRange } from 'react-day-picker'
import cycleService, {type CreateCycle} from '../services/cycle'


type Bookclub = {
  id: number
  name: string
  invite_code: string
}

type Props = {
  bookclubId: string
}

export const NewCycle = ({ bookclubId }: Props) => {
  const [bookclub, setBookclub] = useState<Bookclub | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
  })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBookclub = async () => {
      try {
        const res = await fetch(`/api/bookclubs/${bookclubId}`)

        if (!res.ok) {
          setBookclub(null)
          return
        }

        const data = (await res.json()) as Bookclub
        setBookclub(data)
      } finally {
        setLoading(false)
      }
    }

    if (bookclubId) void fetchBookclub()
  }, [bookclubId])

  const handleCreate = async () => {
    if (dateRange?.from && dateRange?.to) {
      const createdcycle: CreateCycle = {
        bookclub_id: bookclubId,
        proposalEnd: dateRange.from,
        votingEnd: dateRange.to,
      }
      try {
        await cycleService.create(createdcycle)
        await navigate(`/club/${bookclubId}`)
      } catch (error) {
        console.error('Failed to create cycle:', error)
      }
    }
  }

  if (loading) return null
  if (!bookclub) return <div>Bookclub not found</div>
  return (  
    <>
      <PageHeader
      badgeText="New Cycle"
      title={bookclub.name}
      description="Suggest books and decide together, what will you enjoy reading with your friends."
      />
      <RangeCalendarComponent dateRange={dateRange} setDateRange={setDateRange}/>
      <div className="flex justify-end border-t border-border/60 pt-4 sm:pt-4">
          <Button onClick={handleCreate}>
            Create
          </Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] sm:gap-8" />
    </>
  )
}