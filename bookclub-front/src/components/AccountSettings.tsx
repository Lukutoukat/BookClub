import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

import userService from '@/services/users'
import { ButtonDialog } from '@/components/ButtonDialog.tsx'
import { useNotification } from '@/context/NotificationContext.tsx'
import { getErrorMessage } from '@/lib/errorMessage.ts'

import { useTranslation } from 'react-i18next'

type AccountSettingsProps = {
	handleLogOut: () => void
}

const AccountSettings = ({ handleLogOut }: AccountSettingsProps) => {
	const { t } = useTranslation('pages')
	const [deleting, setDeleting] = useState(false)
	const { showError } = useNotification()

	const deleteAccount = async () => {
		// Set deletion state
		setDeleting(true)

		// Attempt to request deletion
		try {
			// Delete account and log out
			await userService.requestDeletion()
			handleLogOut()
		} catch (error) {
			// Failed to delete
			const errorMessage = getErrorMessage(error)
			showError('Failed to delete account: ' + errorMessage)
		} finally {
			// Reset deletion state
			setDeleting(false)
		}
	}

	return (
		<Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
			<CardHeader className="border-b border-border/60 py-4 sm:py-8">
				<CardTitle className="text-xl sm:text-2xl">{t('settings.account.title')}</CardTitle>
				<CardDescription className="text-sm sm:text-base">
					{t('settings.account.description')}
				</CardDescription>
			</CardHeader>

			<div className="flex gap-2 md:gap-4 px-4 sm:px-6 md:px-8 ">
				<Button onClick={handleLogOut} className="flex-1 min-w-0">
					{t('settings.account.logout')}
				</Button>

				<ButtonDialog
					buttonClassName="flex-1 min-w-0"
					buttonText={deleting ? t('settings.account.deleting') : t('settings.account.delete')}
					buttonOnClick={deleteAccount}
					disabled={deleting}
					alertDialogDescription={t('settings.account.deleteWarning')}
					alertDialogContinueText={t('actions.delete', { ns: 'common' })}
					alertDialogText={t('settings.account.deleteQuestion')}
				/>
			</div>
		</Card>
	)
}

export default AccountSettings
