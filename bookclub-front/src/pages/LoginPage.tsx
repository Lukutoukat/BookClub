import { Link } from 'react-router-dom'

import LoginForm from '../components/LoginForm'

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
              Login to be able to suggest books and keep track of your reading
              list.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 sm:pt-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default LoginPage
