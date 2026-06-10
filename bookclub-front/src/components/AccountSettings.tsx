import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'

type AccountSettingsProps = {
  handleLogOut: () => void
}

const AccountSettings = ({ handleLogOut }: AccountSettingsProps) => {
  return (
    <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">

      <CardHeader className="border-b border-border/60 py-4 sm:py-6">
        <CardTitle className="text-xl sm:text-2xl">Account</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Change your account settings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
      <div className="space-y-2">
        <Button onClick={handleLogOut} size="lg" className="w-full sm:w-auto">
          Log out
        </Button>
      </div>

      </CardContent>
    </Card>
  )
}

export default AccountSettings