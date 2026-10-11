import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import bookclubService from '../services/bookclubs'
import { PageHeader } from './PageHeader'
import { ButtonDialog } from './ButtonDialog'
import { Card, CardContent } from './ui/card'
import { SectionHeader } from './SectionHeader'
import { BookclubMemberList } from './BookclubMemberList'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useNotification } from '@/context/NotificationContext.tsx'
import { getErrorMessage } from '@/lib/errorMessage.ts'
import { useTranslation } from 'react-i18next'

type Props = {
  bookclubId: string
}

export const ClubSettingsDisplay = ({ bookclubId }: Props) => {
  const { t } = useTranslation('pages')
  const navigate = useNavigate()
  const { showError, showSuccess } = useNotification()

  const [limitEnabled, setLimitEnabled] = useState(false)
  const [maxBooksPerUser, setMaxBooksPerUser] = useState(1)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchClubSettings = async () => {
      try {
        const club = await bookclubService.get(bookclubId)

        if (!club) {
          return
        }

        if ((club.maxBooksPerUser ?? 0) > 0) {
          setLimitEnabled(true)
          setMaxBooksPerUser(club.maxBooksPerUser as number)
        } else {
          setLimitEnabled(false)
          setMaxBooksPerUser(1)
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        showError('Failed to load settings: ' + errorMessage)
      }
    }

    void fetchClubSettings()
  }, [bookclubId, showError])

  const handleSave = async () => {
    setSaving(true)

    try {
      const nextValue = limitEnabled ? Math.max(1, Number(maxBooksPerUser) || 1) : 0

      await bookclubService.update(bookclubId, {
        maxBooksPerUser: nextValue
      })

      showSuccess('Book limit updated successfully')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showError('Failed to update book limit: ' + errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletion = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault()

    try {
      await bookclubService.remove(bookclubId)
      await navigate('/home', { replace: true })
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showError('Failed to delete club: ' + errorMessage)
    }
  }

  return (
    <>
      <PageHeader
        badgeText={t('labels.settings', { ns: 'common' })}
        title={t('club.settings.title')}
        description={t('club.settings.description')}
        buttonText={t('actions.back', { ns: 'common' })}
        buttonOnClick={async () => {
          try {
            await navigate(`/club/${bookclubId}`)
          } catch {}
        }}
      />

      <Card className="card-base">
        <SectionHeader
          title={t('club.settings.manageMembers.title')}
          description={t('club.settings.manageMembers.description')}
        />
        <CardContent>
          <BookclubMemberList
            bookclubId={bookclubId}
            canManageMembers={true}
            className="member-list"
          />
        </CardContent>

        <SectionHeader
          title="Book limit"
          description="Set a maximum number of books each member can propose in a cycle."
        />
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="enable-book-limit"
              type="checkbox"
              checked={limitEnabled}
              onChange={(event) => setLimitEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="enable-book-limit" className="cursor-pointer">
              Enable maximum books per member
            </Label>
          </div>

          {limitEnabled && (
            <div className="space-y-2">
              <Label htmlFor="max-books-per-user">Maximum books per member</Label>
              <Input
                id="max-books-per-user"
                type="number"
                min={1}
                max={100}
                value={maxBooksPerUser}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  setMaxBooksPerUser(Number.isFinite(value) ? value : 1)
                }}
                className="w-32"
              />
            </div>
          )}

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>

        <SectionHeader
          title={t('club.settings.manageClub.title')}
          description={t('club.settings.manageClub.description')}
        />
        <CardContent className="card-content">
          <ButtonDialog
            buttonText={t('actions.deleteClub', { ns: 'common' })}
            buttonOnClick={handleDeletion}
            alertDialogDescription={t('club.settings.deleteWarning')}
            alertDialogContinueText={t('actions.delete', { ns: 'common' })}
            alertDialogText={t('club.settings.deleteQuestion')}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default ClubSettingsDisplay
