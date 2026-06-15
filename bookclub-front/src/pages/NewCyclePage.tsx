import { useParams } from 'react-router-dom'
import { NewCycle } from '@/components/NewCycle'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'
import { EndPhase } from '@/components/EndPhase'

const NewCyclePage = () => {
  const { bookclubId } = useParams<{ bookclubId : string }>()

  if (!bookclubId) return <div>Missing bookclub id</div>

  return (
    <>
      <UserLoginDisplay />
      <NewCycle bookclubId={bookclubId} />
      <EndPhase bookclubId={bookclubId} />
    </>
  )
}

export default NewCyclePage