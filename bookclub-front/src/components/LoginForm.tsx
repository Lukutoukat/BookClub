import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginFormProps = {
  username: string
  password: string
  setUsername: React.Dispatch<React.SetStateAction<string>>
  setPassword: React.Dispatch<React.SetStateAction<string>>
  handleLogin: (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => Promise<void>
}

const LoginForm = ({
  username,
  password,
  setUsername,
  setPassword,
  handleLogin
}: LoginFormProps) => {
  return (
    <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 rounded-3xl border border-border/70 bg-muted/20 p-4 shadow-sm sm:gap-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-foreground">
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

      <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Login
        </Button>
      </div>
    </form>
  )
}

export default LoginForm
