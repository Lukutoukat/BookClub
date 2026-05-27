import { PageLayout } from '../components/PageLayout'
import { PageHeader } from '../components/PageHeader'
import { PageMenu } from '@/components/PageMenu'

import ClubSettings from '@/components/ClubSettings'
import AccountSettings from '@/components/AccountSettings'

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
  
    <PageMenu />
    </PageLayout>
  )
}

export default SettingsPage