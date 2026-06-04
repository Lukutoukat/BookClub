import { useParams } from 'react-router-dom'
import { BookclubComponent } from '@/components/BookclubComponent'
import BookSelector from '@/components/BookSelector'
import BookList from '@/components/BookList'
import BookClubGoCycleSetting from '@/components/bookClubGoCycleSetting'

const BookclubPage = () => {
  const { bookclubId } = useParams<{ bookclubId : string }>()

  if (!bookclubId) return <div>Missing bookclub id</div>

  return (
    <>
      <BookclubComponent bookclubId={bookclubId} />
      <BookSelector onBookSelected={(bookId) => console.log('Selected book ID:', bookId)} />
      <BookList/>
      <BookClubGoCycleSetting />
    </>
  )
}

export default BookclubPage