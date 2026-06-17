import bookclubService from '../services/bookclubs'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import { ButtonDialog } from './ButtonDialog'
import { Card } from './ui/card'
import { SectionHeader } from './SectionHeader'
import { CardContent } from './ui/card'
type Props = {
  bookclubId: string
}

export const ClubSettingsDisplay = ({ bookclubId }: Props) => {
  const navigate = useNavigate()
    const handleDeletion = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
      event.preventDefault()
      try {
        await bookclubService.remove(bookclubId)
        await navigate('/home', { replace: true })
      } catch (error) {
        console.error('error during deletion', error)
      }
    }

  return (
    <>
    <PageHeader
      badgeText="Settings"
      title="Book Club Settings"
      description="Suggest books and decide your next read together."
      buttonText="Back"
      buttonOnClick={async () => {
        try {
          await navigate(`/club/${bookclubId}`)
        } catch {}
      }}
    />
    <Card className="card-base">
      <SectionHeader title="Delete club" description="If you want to delete your club and erase all information related to it, you can do that below." />
      <CardContent className="card-content">
          <ButtonDialog
            buttonText="Delete club"
            buttonOnClick={handleDeletion}
            alertDialogDescription="Once the book club is deleted, it cannot be undone."
            alertDialogContinueText = 'Delete permanently'
          />
      </CardContent>
    </Card>
  </>
  )
}

export default ClubSettingsDisplay