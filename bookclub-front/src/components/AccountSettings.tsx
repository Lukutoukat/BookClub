import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

import userService from '@/services/users'
import { ButtonDialog } from '@/components/ButtonDialog.tsx'

type AccountSettingsProps = {
	handleLogOut: () => void
}

const AccountSettings = ({ handleLogOut }: AccountSettingsProps) => {
	const [deleting, setDeleting] = useState(false)

	const deleteAccount = async () => {
		// Deletion already in progress
		if (deleting) {
			return
		}

		// Set deletion state
		setDeleting(true)

		// Attempt to request deletion
		try {
			// Delete account and log out
			await userService.requestDeletion()
			handleLogOut()
		} catch (error) {
			// Failed to delete
			// TODO: Replace this with an error toast
			console.log('Failed to delete account', error)
		} finally {
			// Reset deletion state
			setDeleting(false)
		}
	}

	return (
		<Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
			<CardHeader className="border-b border-border/60 py-4 sm:py-8">
				<CardTitle className="text-xl sm:text-2xl">Account</CardTitle>
				<CardDescription className="text-sm sm:text-base">
					Change your account settings
				</CardDescription>
			</CardHeader>

			<div className="flex gap-2 md:gap-4 px-4 sm:px-6 md:px-8 ">
				<Button onClick={handleLogOut} className="flex-1 min-w-0">
					Log out
				</Button>

				<ButtonDialog
					buttonClassName="flex-1 min-w-0"
					buttonText={deleting ? 'Deleting...' : 'Delete Account'}
					buttonOnClick={deleteAccount}
					disabled={deleting}
					alertDialogDescription="Once your account is deleted, it cannot be undone."
					alertDialogContinueText="Delete"
					alertDialogText="Are you sure you want to delete your account?"
				/>
			</div>
		</Card>
	)
}

export default AccountSettings
