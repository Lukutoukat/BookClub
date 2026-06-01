import { PageLayout } from '../components/PageLayout'
import { useParams } from 'react-router-dom'
import { BookclubComponent } from '../components/BookclubComponent'

const BookclubPage = () => {
  const { bookclubId } = useParams<{ bookclubId : string }>()

  if (!bookclubId) return <div>Missing bookclub id</div>

  return (
    <PageLayout>
      <BookclubComponent bookclubId={bookclubId} />
    </PageLayout>
  )
}

export default BookclubPage
