import { useParams } from 'react-router-dom'
import { NewCycle } from '@/components/NewCycle'

const NewCyclePage = () => {
  const { bookclubId } = useParams<{ bookclubId : string }>()

  if (!bookclubId) return <div>Missing bookclub id</div>

  return (
    <>
      <NewCycle bookclubId={bookclubId} />
    </>
  )
}

export default NewCyclePage