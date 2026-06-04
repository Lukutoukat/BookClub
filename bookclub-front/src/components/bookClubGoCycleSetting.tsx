import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'


export const bookClubGoCycleSetting = ({}) => {
    return (
        <Card className="card-base">
              <SectionHeader
                title="Manage book club"
              />
                <Button>
                <Link to="/bookclubcyclesettings">
                    Manage cycle
                </Link>
            </Button>
                <Button>
                <Link to="/bookclubsettings">
                    Manage club
                </Link>
            </Button>
            
        </Card>
    )
}

export default bookClubGoCycleSetting