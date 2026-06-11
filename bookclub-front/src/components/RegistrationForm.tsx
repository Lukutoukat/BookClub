import { useState } from 'react'
import { AxiosError } from 'axios'
import userService, { type CreateUser } from '@/services/users'
import { SectionHeader } from './SectionHeader'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import { useNavigate } from 'react-router-dom'

const emptyUser: CreateUser = {
  email: '',
  name: '',
  password: ''
}

const RegistrationForm = () => {
  const [newUser, setNewUser] = useState<CreateUser>(emptyUser)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

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

  const isValidPassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
  }

  const addUser = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (newUser.password !== confirmPassword) {
      setMessage('Passwords do not match!')
      return
    }

    if (!isValidPassword(newUser.password)) {
      alert(
        "Password must be at least 8 characters long and include uppercase, lowercase and a number."
      )
      return
    }

    try {
      await userService.create(newUser)
      setNewUser(emptyUser)
      setConfirmPassword('')
      setMessage('Registration saved.')
      await navigate('/login')
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as Record<string, unknown>
        if (errorData.error && typeof errorData.error === 'string') {
          setMessage(errorData.error)
        } else {
          setMessage("Registration failed")
        }
      } else if (err instanceof AxiosError) {
        setMessage("Registration failed")
      } else {
        setMessage("Unexpected error occurred")
      }
    }
  }

  return (
      <Card className="card-base">
        <SectionHeader 
        title="Create an account" 
        description="Create an account and begin your reading journey with friends."
        />
        
      <CardContent className="card-content">
        <form onSubmit={addUser} className="card-form">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </FieldContent>
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field>
                <FieldLabel htmlFor="name">Username</FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleChange}
                    autoComplete="name"
                    placeholder="Your name"
                    required
                  />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Secure password"
                  required
                  minLength={8}
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                  title="Password must be at least 8 characters long and include uppercase, lowercase, and a number."
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <FieldContent>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  required
                />
              </FieldContent>
            </Field>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded text-primary text-sm">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
            <p className="max-w-md text-xs text-muted-foreground">
              Double-check the details before creating the account.
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Create a new account
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
  )
}

export default RegistrationForm
