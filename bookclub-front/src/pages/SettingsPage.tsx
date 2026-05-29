import { PageLayout } from '../components/PageLayout'
import { PageHeader } from '../components/PageHeader'
import { useLogin } from '@/hooks/useLogin'

import ClubSettings from '@/components/ClubSettings'
import AccountSettings from '@/components/AccountSettings'
import ThemeSelector from '@/components/ThemeSelector'

const SettingsPage = () => {
  const { logout } = useLogin()

  return (
    <PageLayout>
      <PageHeader
        badgeText="Settings"
        title="Settings"
        description="Change your settings or create or join a book club."
      />

      <ClubSettings />

      <AccountSettings handleLogOut={logout} />

      <ThemeSelector />
  
    </PageLayout>
  )
}

export default SettingsPage