import { PageLayout } from '../components/PageLayout'
import { useParams } from 'react-router-dom'
import { BookclubComponent } from '../components/BookclubComponent'
import BookSelector from '@/components/BookSelector'

const BookclubPage = () => {
  const { bookclubId } = useParams<{ bookclubId : string }>()

  if (!bookclubId) return <div>Missing bookclub id</div>

  return (
    <PageLayout>
      <BookclubComponent bookclubId={bookclubId} />
      <BookSelector onBookSelected={(bookId) => console.log('Selected book ID:', bookId)} />
    </PageLayout>
  )
}

export default BookclubPage
