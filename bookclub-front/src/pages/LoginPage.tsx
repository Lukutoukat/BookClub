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
        description="Create your own book club and start reading with your friends."
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
            message={message}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default LoginPage
