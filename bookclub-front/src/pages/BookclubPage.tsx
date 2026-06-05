import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookclubComponent } from '@/components/BookclubComponent'
import BookSelector from '@/components/BookSelector'
import BookList, { type BookListHandle} from '@/components/BookList'
import BookClubGoCycleSetting from '@/components/bookClubGoCycleSetting'
import getLatestCycle from '@/services/cycle'

const BookclubPage = () => {
  const { bookclubId } = useParams<{ bookclubId : string }>()
  const bookListRef = useRef<BookListHandle>(null)
  const [cycleId, setCycleId] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!bookclubId) return

    setIsLoading(true)
    getLatestCycle.getLatestCycle(bookclubId)
      .then((cycle) => {
        setCycleId(cycle?.id)
      })
      .catch((error) => {
        console.error("Error fetching cycle:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [bookclubId])

  const handleBookAdded = async () => {
    await bookListRef.current?.reload()
  }

  if (!bookclubId) return <div>Missing bookclub id</div>

  if (isLoading) return <div>Loading cycle data...</div>

  return (
    <>
      <BookclubComponent bookclubId={bookclubId} />
      <BookSelector onBookAdded={handleBookAdded} bookclubId={bookclubId} />
      <BookList ref={bookListRef} show="proposedBooks" cycleId={cycleId} />
      <BookClubGoCycleSetting />
    </>
  )
}

export default BookclubPage