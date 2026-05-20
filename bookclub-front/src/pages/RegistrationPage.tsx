import { useState } from 'react'
import { Link } from 'react-router-dom'

import RegistrationForm from '../components/RegistrationForm'
import userService, { type CreateUser } from '../services/users'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,247,240,0.95),_rgba(250,244,235,0.96)_35%,_rgba(238,242,246,0.92)_70%,_rgba(247,247,242,1))] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" className="w-fit uppercase tracking-[0.2em]">
              Registration
            </Badge>
            <div className="space-y-2">
              <h1 className="font-heading text-4xl leading-none sm:text-5xl">
                Join the club
              </h1>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/books">Back to books</Link>
          </Button>
        </header>

        <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
          <CardHeader className="border-b border-border/60 py-5 sm:py-6">
            <CardTitle className="text-2xl">Register a user</CardTitle>
            <CardDescription>
              Create a new account to be able to suggest books and keep track of your reading list.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 sm:pt-6">
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
      </div>
    </main>
  )
}

export default RegistrationPage
