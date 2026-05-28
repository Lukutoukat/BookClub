import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import bookclubmembersService, { type AddBookClubMember } from '../services/bookclubmembers'

const emptyJoinRequest: AddBookClubMember = {
  invite_code: ''
}

const ClubSettings = () => {
  const [inviteCode, setInviteCode] = useState<AddBookClubMember>(emptyJoinRequest)
  const [message, setMessage] = useState<string | null>(null)

  const handleJoinSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault()
      setMessage(inviteCode.invite_code.trim().length === 5 ? 'Join request sent.' : 'Enter a 5-character code.')
      try {
        await bookclubmembersService.create({
          invite_code: inviteCode.invite_code.trim().toUpperCase()
        })} catch (error) {
          setMessage('Failed to send join request. Please try again.',)
          
        }
      }
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setInviteCode((inviteCode) => ({
      ...inviteCode,
      [name]: value
    }))
  }

  

  return (
    <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">

      <CardHeader className="border-b border-border/60 py-4 sm:py-6">
        <CardTitle className="text-xl sm:text-2xl">Clubs</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Join or create your own book club.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">

        <div className="space-y-2">
          <Label htmlFor="join-code">Join with code</Label>
          <p className="text-sm text-muted-foreground">
            Enter the invite code you received from your club.
          </p>
          <form className="flex items-center gap-2" onSubmit={handleJoinSubmit}>
            <Input
              id="join-code"
              name="invite_code"
              maxLength={5}
              value={inviteCode.invite_code}
              onChange={handleChange}
              className="w-[9ch]"
            />
            <Button type="submit">Join</Button>
          </form>
        </div>

        <div className="space-y-2">
          <Label>Create a new club</Label>
          <p className="text-sm text-muted-foreground">
            Set up a new club and invite others to join.
          </p>
          <Button asChild>
            <Link to="/create">Create</Link>
          </Button>
        </div>

        {message ? (
          <p className="rounded-3xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default ClubSettings