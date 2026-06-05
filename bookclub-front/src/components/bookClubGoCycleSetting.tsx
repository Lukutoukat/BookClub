import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'

type Props = {
  bookclubId: string
}

export const bookClubGoCycleSetting = ({ bookclubId }: Props) => {
  return (
    <Card className="card-base">
      <SectionHeader
        title="Manage book club"
      />
      <Button>
        <Link to={`/newcycle/${bookclubId}`}>
          Manage cycle
        </Link>
      </Button>
      <Button asChild>
        <Link to="/bookclubsettings">
          Manage club
        </Link>
      </Button>
    </Card>
  )
}

export default bookClubGoCycleSetting