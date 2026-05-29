import { PageHeader } from '../components/PageHeader'

import ClubSettings from '@/components/ClubSettings'
import AccountSettings from '@/components/AccountSettings'
import ThemeSelector from '@/components/ThemeSelector'

const SettingsPage = () => {
  return (
    <>
      <PageHeader
        badgeText="Settings"
        title="Settings"
        description="Change your settings or create or join a book club."
      />

      <ClubSettings />

      <AccountSettings />

      <ThemeSelector />
  
    </>
  )
}

export default SettingsPage