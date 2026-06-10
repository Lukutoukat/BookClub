import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

type LoginFormProps = {
  username: string
  password: string
  setUsername: React.Dispatch<React.SetStateAction<string>>
  setPassword: React.Dispatch<React.SetStateAction<string>>
  handleLogin: (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => Promise<void>
  message: string | null
}

const LoginForm = ({
  username,
  password,
  setUsername,
  setPassword,
  handleLogin,
  message
}: LoginFormProps) => {

  const navigate = useNavigate()
  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 rounded-3xl border border-border/70 bg-muted/20 p-4 shadow-sm sm:gap-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm text-foreground">
              Username
            </Label>

            <Input
              id="username"
              name="username"
              type="username"
              autoComplete="username"
              placeholder="ilovebookssomuch"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-foreground">
              Password
            </Label>

            <Input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>
        </div>
          {message ? (
            <p className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded text-primary text-sm">
              {message}
            </p>
          ) : null}
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Log in
          </Button>
        </div>
      </form>
      <div className="flex flex-col gap-3 border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
        <Button type="button" onClick={() => navigate('/passwordreset')}>
          Forgot password?
        </Button>
      </div>
    </>
  )
}

export default LoginForm
