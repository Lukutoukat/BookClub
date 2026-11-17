import { useEffect, useState, type FormEvent } from 'react'
import bookclubService from '../services/bookclubs'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import { ButtonDialog } from './ButtonDialog'
import { Card, CardContent } from './ui/card'
import { SectionHeader } from './SectionHeader'
import { BookclubMemberList } from './BookclubMemberList'
import { useNotification } from '@/context/NotificationContext.tsx'
import { getErrorMessage } from '@/lib/errorMessage.ts'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

type Props = {
  bookclubId: string
}

export const ClubSettingsDisplay = ({ bookclubId }: Props) => {
  const { t } = useTranslation('pages')
  const navigate = useNavigate()
  const { showError, showSuccess } = useNotification()
  const [suggestionLimitEnabled, setSuggestionLimitEnabled] = useState(false)
  const [suggestionLimit, setSuggestionLimit] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    let isMounted = true
    void bookclubService.get(bookclubId).then((club) => {
      if (!isMounted || !club) return
      setSuggestionLimitEnabled(club.suggestionLimitEnabled ?? false)
      setSuggestionLimit(club.suggestionLimit?.toString() ?? '')
    })
    return () => {
      isMounted = false
    }
  }, [bookclubId])

  const handleSuggestionSettingsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (suggestionLimitEnabled && (!Number.isInteger(Number(suggestionLimit)) || Number(suggestionLimit) < 1)) {
      showError(t('club.settings.suggestionLimit.invalid'))
      return
    }

    setIsSavingSettings(true)
    try {
      await bookclubService.updateSuggestionSettings(bookclubId, {
        suggestionLimitEnabled,
        suggestionLimit: suggestionLimitEnabled ? Number(suggestionLimit) : null
      })
      showSuccess(t('club.settings.suggestionLimit.saved'))
    } catch (error) {
      showError(getErrorMessage(error, t('club.settings.suggestionLimit.saveFailed')))
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleDeletion = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault()
    try {
      await bookclubService.remove(bookclubId)
      await navigate('/home', { replace: true })
    } catch (error) {
      showError('Failed to delete club: ' + getErrorMessage(error))
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
          title={t('club.settings.manageClub.title')}
          description={t('club.settings.manageClub.description')}
        />
        <CardContent className="card-content space-y-6">
          <form className="space-y-4" onSubmit={handleSuggestionSettingsSubmit}>
            <div className="flex items-center gap-3">
              <input
                id="suggestion-limit-enabled"
                type="checkbox"
                checked={suggestionLimitEnabled}
                onChange={(event) => setSuggestionLimitEnabled(event.target.checked)}
              />
              <Label htmlFor="suggestion-limit-enabled">
                {t('suggestionLimit.enable', { ns: 'clubSettings' })}
              </Label>
            </div>
            {suggestionLimitEnabled && (
              <div className="max-w-xs space-y-2">
                <Label htmlFor="suggestion-limit-amount">
                  {t('suggestionLimit.amount', { ns: 'clubSettings' })}
                </Label>
                <Input
                  id="suggestion-limit-amount"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={suggestionLimit}
                  onChange={(event) => setSuggestionLimit(event.target.value)}
                />
              </div>
            )}
            <Button type="submit" disabled={isSavingSettings}>
              {isSavingSettings
                ? t('suggestionLimit.saving', { ns: 'clubSettings' })
                : t('actions.update', { ns: 'common' })}
            </Button>
          </form>
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
