import { useState } from 'react'

import RegistrationForm from '../components/RegistrationForm'
import userService, { type CreateUser } from '../services/users'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { PageLayout } from '@/components/PageLayout'
import { PageHeader } from '@/components/PageHeader'

const emptyUser: CreateUser = {
  email: '',
  name: '',
  password: ''
}

const RegistrationPage = () => {
  const [newUser, setNewUser] = useState<CreateUser>(emptyUser)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setNewUser((currentUser) => ({
      ...currentUser,
      [name]: value
    }))
  }

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value)
  }

  const addUser = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (newUser.password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    await userService.create(newUser)
    setNewUser(emptyUser)
    setConfirmPassword('')
    setMessage('Registration saved.')
  }

  return (
    <PageLayout>
      <PageHeader
        badgeText="Registration"
        title="Join the club"
        description="Register, join your book club, suggest books, decide together, and keep track books easily."
        buttonText="Back to books"
        buttonLink="/books"
      />

        <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
          <CardHeader className="border-b border-border/60 py-4 sm:py-6">
            <CardTitle className="text-xl sm:text-2xl">Register a user</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Create a new account to be able to suggest books and keep track of your reading list.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
            <RegistrationForm
              addUser={addUser}
              confirmPassword={confirmPassword}
              newUser={newUser}
              handleChange={handleChange}
              handleConfirmPasswordChange={handleConfirmPasswordChange}
            />
            {message ? (
              <p className="rounded-3xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                {message}
              </p>
            ) : null}
          </CardContent>
        </Card>
    </PageLayout>
  )
}

export default RegistrationPage
