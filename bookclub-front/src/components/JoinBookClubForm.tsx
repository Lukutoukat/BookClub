import { useState } from 'react'
import { AxiosError } from 'axios'

import bookclubmembersService, { type AddBookClubMember } from '@/services/bookclubmembers'
import { SectionHeader } from './SectionHeader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'

const emptyJoinRequest: AddBookClubMember = {
  invite_code: ''
}

const JoinBookClubForm = () => {
  const [inviteCode, setInviteCode] = useState<AddBookClubMember>(emptyJoinRequest)
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setInviteCode((inviteCode) => ({
      ...inviteCode,
      [name]: value
    }))
  }

  const handleJoinSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedCode = inviteCode.invite_code.trim()

    if (trimmedCode.length !== 5) {
      setMessage('Enter a 5-character code.')
      return
    }

    try {
      await bookclubmembersService.create({
        invite_code: trimmedCode.toUpperCase()
      })
      setInviteCode(emptyJoinRequest)
      setMessage('Join request sent.')
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as Record<string, unknown>
        if (errorData.error && typeof errorData.error === 'string') {
          setMessage(errorData.error)
        } else {
          setMessage('Registration failed')
        }
      } else if (err instanceof AxiosError) {
        setMessage('Registration failed')
      } else {
        setMessage('Unexpected error occurred')
      }
    }
  }

  return (
    <Card className="card-base">
      <SectionHeader
        title="Join a book club"
        description="Enter an invite code to join an existing book club and start tracking your reading."
      />

      <CardContent className="card-content">
        <form onSubmit={handleJoinSubmit} className="card-form">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel htmlFor="invite-code">Invite code</FieldLabel>
                <FieldContent>
                  <Input
                    id="invite-code"
                    name="invite_code"
                    maxLength={5}
                    value={inviteCode.invite_code}
                    onChange={handleChange}
                    placeholder="XXXXX"
                    required
                  />
                </FieldContent>
              </Field>
            </div>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded text-primary text-sm">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
            <p className="max-w-md text-xs text-muted-foreground">
              You&apos;ll receive an invite code from your book club administrator.
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Join club
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default JoinBookClubForm
