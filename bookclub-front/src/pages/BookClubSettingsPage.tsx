import { useParams } from 'react-router-dom'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'
import ClubSettingsDisplay from '@/components/ClubSettingsDisplay'
const ClubSettingsPage = () => {
  const { bookclubId } = useParams<{ bookclubId: string }>()

  if (!bookclubId) return <div>Missing bookclub id</div>

  return (
    <>
      <UserLoginDisplay />
      <ClubSettingsDisplay bookclubId={bookclubId} />
    </>
  )
}

export default ClubSettingsPage
