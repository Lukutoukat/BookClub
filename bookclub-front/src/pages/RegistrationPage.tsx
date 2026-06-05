import RegistrationForm from '@/components/RegistrationForm'

import { PageHeader } from '@/components/PageHeader'

const RegistrationPage = () => {
  return (
    <>
      <PageHeader
        badgeText="Registration"
        title="Join the club"
        description="Register, join your book club, suggest books, decide together, and keep track of books easily."
        buttonText="Go to login"
        buttonLink="/login"
      />

      <RegistrationForm />
    </>
  )
}

export default RegistrationPage
