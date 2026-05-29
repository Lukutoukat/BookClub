import RegistrationForm from '../components/RegistrationForm'

import { PageLayout } from '@/components/PageLayout'
import { PageHeader } from '@/components/PageHeader'

const RegistrationPage = () => {
  return (
    <PageLayout>
      <PageHeader
        badgeText="Registration"
        title="Join the club"
        description="Register, join your book club, suggest books, decide together, and keep track books easily."
        buttonText="Go to login"
        buttonLink="/login"
      />

      <RegistrationForm />
    </PageLayout>
  )
}

export default RegistrationPage
