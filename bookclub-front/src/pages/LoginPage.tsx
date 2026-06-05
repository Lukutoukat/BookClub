import { useState } from 'react'

import LoginForm from '@/components/LoginForm'
import { useLogin } from '@/hooks/useLogin'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, message } = useLogin()

  const handleLogin = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    await login(username, password)
    setUsername('')
    setPassword('')
  }


    
  return (
    <>
      <PageHeader
        badgeText="Login"
        title="Join the club"
        description="Log in to be able to join bookclubs and save the books you want to read in one place."
        buttonText="Go to registration"
        buttonLink="/registration"
      />

      <Card className="card-base">
        <CardHeader className="card-header">
          <CardTitle className="text-xl sm:text-2xl">Login</CardTitle>

          <CardDescription className="text-sm sm:text-base">
            
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6">
          <LoginForm 
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />
          {message ? (
            <p className="rounded-3xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}

export default LoginPage
