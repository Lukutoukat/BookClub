import type { CreateUser } from "../services/users"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type RegistrationFormProps = {
  addUser: (event: React.SyntheticEvent<HTMLFormElement>) => Promise<void>,
  newUser: CreateUser,
  confirmPassword: string,
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleConfirmPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const RegistrationForm = ({
  addUser,
  newUser,
  confirmPassword,
  handleChange,
  handleConfirmPasswordChange
}: RegistrationFormProps) => {
  return (
    <form onSubmit={addUser} className="space-y-6">
      <div className="grid gap-5 rounded-3xl border border-border/70 bg-muted/20 p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-foreground">
            Email address
          </Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-foreground">
            Full name
          </Label>
          <Input
            id="name"
            name="name"
            value={newUser.name}
            onChange={handleChange}
            autoComplete="name"
            placeholder="Your name"
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
            value={newUser.password}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Secure password"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm text-foreground">
            Confirm Password
          </Label>
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
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm text-muted-foreground">
          Double-check the details before creating the account.
        </p>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Register user
        </Button>
      </div>
    </form>
  )
}

export default RegistrationForm
