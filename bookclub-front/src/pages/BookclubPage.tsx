import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { BookclubComponent } from '@/components/BookclubComponent'
import BookSelector from '@/components/BookSelector'
import BookList, { type BookListHandle} from '@/components/BookList'
import BookClubGoCycleSetting from '@/components/bookClubGoCycleSetting'
import getLatestCycle from '@/services/cycle'

const BookclubPage = () => {
  const { bookclubId } = useParams<{ bookclubId : string }>()
  const bookListRef = useRef<BookListHandle>(null)
  const currentCycle = getLatestCycle.getLatestCycle(bookclubId as string).id

  const handleBookAdded = async () => {
    await bookListRef.current?.reload()
  }

  if (!bookclubId) return <div>Missing bookclub id</div>

  return (
    <>
      <BookclubComponent bookclubId={bookclubId} />
      <BookSelector onBookSelected={handleBookAdded} bookclubId={bookclubId} />
      <BookList cycleId={currentCycle} />
      <BookClubGoCycleSetting bookclubId={bookclubId} />
    </>
  )
}

export default BookclubPage