import { PageHeader } from "@/components/PageHeader"

const PasswordResetPage = () => {
  return (
    <>
      <PageHeader
        badgeText="password reset"
        title="Reset your password"
        description="Reset your passoword using the email attached to your account."
        buttonText="back to login"
        buttonLink="/login"
      />
    </>
  )
}

export default PasswordResetPage