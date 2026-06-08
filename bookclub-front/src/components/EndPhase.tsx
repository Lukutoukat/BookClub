import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import cycleService from '../services/cycle'

import { Button } from '@/components/ui/button'

type Props = {
  bookclubId: string
}

export const EndPhase = ({ bookclubId }: Props) => {

  const handleEndPhase = async () => {
    try {
      await cycleService.endLatestCyclePhase(bookclubId)
    } catch (error) {
      console.error('Failed to end phase:', error)
    }
  }

  return (
    <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">

      <CardHeader className="border-b border-border/60 py-4 sm:py-6">
        <CardTitle className="text-xl sm:text-2xl">Phase</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
      <div className="space-y-2">
        <Button onClick={handleEndPhase} size="lg" className="w-full sm:w-auto">
          End current phase
        </Button>
      </div>

      </CardContent>
    </Card>
  )
}