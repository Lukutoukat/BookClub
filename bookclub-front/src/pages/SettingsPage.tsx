import { PageHeader } from '@/components/PageHeader'
import { BottomDescription } from '@/components/BottomDescription'
import { useLogin } from '@/hooks/useLogin'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'
import ClubSettings from '@/components/ClubSettings'
import AccountSettings from '@/components/AccountSettings'
import ThemeSelector from '@/components/ThemeSelector'

const SettingsPage = () => {
  const { logout } = useLogin()

  return (
    <>
      <UserLoginDisplay />
      <PageHeader
        badgeText="Settings"
        title="Settings"
        description="Change your settings or create or join a book club."
      />

      <ClubSettings />

      <AccountSettings handleLogOut={logout} />

      <ThemeSelector />

      <BottomDescription />
  
    </>
  )
}

export default SettingsPage