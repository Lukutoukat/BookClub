import { useParams } from 'react-router-dom'
import ClubSettingsDisplay from '@/components/ClubSettingsDisplay'
const ClubSettingsPage = () => {
  const { bookclubId } = useParams<{ bookclubId: string }>()

  if (!bookclubId) return <div>Missing bookclub id</div>

  return (
    <>
      <ClubSettingsDisplay bookclubId={bookclubId} />
    </>
  )
}

export default ClubSettingsPage
