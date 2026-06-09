import { useNavigate } from 'react-router-dom'

import { type BookClub } from '@/services/bookclubs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'

export interface BookClubListHandle {
  reload: () => Promise<void>
}


type Props = {
  bookClubs: BookClub[]
  isLoading: boolean
  errorMessage: string | null
}

const BookClubItem = ({ bookClub }: { bookClub: BookClub }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    void navigate(`/club/${bookClub.id}`)
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      className="w-full justify-start h-auto"
    >
      <Card className="w-full border-border/60 bg-background/80 shadow-sm transition-all hover:bg-background/90 cursor-pointer">
        <CardContent className="px-3 py-2 sm:px-4 sm:py-3 pl-4 sm:pl-5">
          <h3 className="text-lg font-semibold text-foreground/90">{bookClub.name}</h3>
        </CardContent>
      </Card>
    </Button>
  )
}

const BookClubList =(({bookClubs, isLoading, errorMessage}: Props) => {
  const clubCount = bookClubs.length
  const description = `${clubCount} ${clubCount === 1 ? 'bookclub' : 'bookclubs'}`

  if (isLoading) {
    return (
      <Card className="card-base">
        <SectionHeader title="Your bookclubs" description={description} />
        <CardContent className="card-content">
          <div className="text-sm text-muted-foreground text-center py-6">
            Loading bookclubs...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (errorMessage) {
    return (
      <Card className="card-base">
        <SectionHeader title="Your bookclubs" description={description} />
        <CardContent className="card-content">
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
            {errorMessage}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (bookClubs.length === 0) {
    return (
      <Card className="card-base">
        <SectionHeader title="Your bookclubs" description={description} />
        <CardContent className="card-content">
          <div className="text-sm text-muted-foreground text-center py-6">
            No bookclubs yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-base">
      <SectionHeader title="Your bookclubs" description={description} />
      <CardContent className="card-content">
        <div className="space-y-3">
          {bookClubs.map((club: BookClub) => (
            <BookClubItem key={club.id} bookClub={club} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

export default BookClubList