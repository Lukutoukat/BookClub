import { PageHeader } from '@/components/PageHeader'
import { BottomDescription } from '@/components/BottomDescription'
import { useLogin } from '@/hooks/useLogin'

import ClubSettings from '@/components/ClubSettings'
import AccountSettings from '@/components/AccountSettings'
import ThemeSelector from '@/components/ThemeSelector'
import { Grid } from '@/components/Grid'

const SettingsPage = () => {
  const { logout } = useLogin()

  return (
    <>
      <PageHeader
        badgeText="Settings"
        title="Settings"
        description="Change your settings or create or join a book club."
      />

      <Grid>
        <ClubSettings />
        <AccountSettings handleLogOut={logout} />
        <ThemeSelector />
      </Grid>

      <BottomDescription />
  
    </>
  )
}

export default SettingsPage