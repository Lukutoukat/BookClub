import { PageLayout } from '../components/PageLayout'
import { PageHeader } from '../components/PageHeader'

import ClubSettings from '@/components/ClubSettings'
import AccountSettings from '@/components/AccountSettings'
import ThemeSelector from '@/components/ThemeSelector'

const SettingsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        badgeText="Settings"
        title="Settings"
        description="Change your settings or create or join a book club."
      />

      <ClubSettings />

      <AccountSettings />

      <ThemeSelector />
  
    </PageLayout>
  )
}

export default SettingsPage