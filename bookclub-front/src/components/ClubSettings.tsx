import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionHeader } from '@/components/SectionHeader'
import bookclubmembersService, { type AddBookClubMember } from '@/services/bookclubmembers'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

const emptyJoinRequest: AddBookClubMember = {
  invite_code: '',
  user_role: 1
}

const ClubSettings = () => {
  const { t } = useTranslation('pages')
  const [inviteCode, setInviteCode] = useState<AddBookClubMember>(emptyJoinRequest)
  const [message, setMessage] = useState<string | null>(null)

  const handleJoinSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inviteCode.invite_code.trim().length !== 5) {
      setMessage(t('error.validation.inviteCode'))
      return
    }
    try {
      await bookclubmembersService.create(inviteCode)
      setMessage(t('success.joinedClub'))
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.error ?? t('error.api.joinClub'))
      } else {
        setMessage(t('error.api.joinClub'))
      }
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setInviteCode((current) => ({ ...current, [name]: value }))
  }

  return (
    <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
      <SectionHeader title={t('settings.clubs.title')} description={t('settings.clubs.description')} />
      <CardContent className="space-y-6 pt-4 sm:space-y-6 sm:pt-8">
        <div className="space-y-4">
          <Label htmlFor="join-code">{t('settings.clubs.join')}</Label>
          <p className="text-sm text-muted-foreground">{t('settings.clubs.joinHint')}</p>
          <form className="flex items-center gap-4" onSubmit={handleJoinSubmit}>
            <Input
              id="join-code"
              name="invite_code"
              maxLength={5}
              value={inviteCode.invite_code}
              onChange={handleChange}
              className="w-[9ch]"
            />
            <Button type="submit">{t('actions.join', { ns: 'common' })}</Button>
          </form>
        </div>
        <div className="space-y-4">
          <Label>{t('settings.clubs.newClub')}</Label>
          <p className="text-sm text-muted-foreground">{t('settings.clubs.newClubHint')}</p>
          <Button asChild>
            <Link to="/create">{t('actions.create', { ns: 'common' })}</Link>
          </Button>
        </div>
        {message ? (
          <p className="rounded-3xl border border-primary/20 bg-primary/5 px-4 py-4 text-sm text-primary">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default ClubSettings
