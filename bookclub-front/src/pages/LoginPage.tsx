import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AxiosError } from 'axios'

import LoginForm from '../components/LoginForm'
import loginService from '../services/login'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password
      })

      localStorage.setItem(
        'loggedBookappUser',
        JSON.stringify(user)
      )

      setUsername('')
      setPassword('')

      void navigate('/books')
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (
          err.response &&
          typeof err.response.data === 'object' &&
          err.response.data !== null &&
          'error' in err.response.data
        ) {
          const backendMessage = (
            err.response.data as { error: string }
          ).error

          setMessage(backendMessage)
        } else {
          setMessage('Wrong credentials')
        }
      } else {
        setMessage('Wrong credentials')
      }
    }  
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(255,247,240,0.95),_rgba(250,244,235,0.96)_35%,_rgba(238,242,246,0.92)_70%,_rgba(247,247,242,1))] px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 sm:gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <Badge
              variant="secondary"
              className="w-fit uppercase tracking-[0.2em] text-[0.7rem] sm:text-xs"
            >
              Login
            </Badge>

            <div className="space-y-1 sm:space-y-2">
              <h1 className="font-heading text-3xl leading-none sm:text-5xl">
                Join the club
              </h1>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/registration">Go to registration</Link>
          </Button>
        </header>

        <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
          <CardHeader className="border-b border-border/60 py-4 sm:py-6">
            <CardTitle className="text-xl sm:text-2xl">Login</CardTitle>

            <CardDescription className="text-sm sm:text-base">
              Log in to be able to join bookclubs and save the books you want to read in one place.
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
      </div>
    </main>
  )
}

export default LoginPage
