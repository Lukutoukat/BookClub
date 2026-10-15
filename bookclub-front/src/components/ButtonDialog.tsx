import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonDialogProps {
	children?: ReactNode
	buttonText?: string
	buttonTitle?: string
	alertDialogText?: string
	alertDialogDescription?: string
	alertDialogCancelText?: string
	alertDialogContinueText?: string
	//eslint-disable-next-line
	buttonOnClick?: any
	buttonVariant?:
		| 'default'
		| 'link'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'destructive'
		| null
		| undefined
	disabled?: boolean
	buttonClassName?: string
}

/**
 * ButtonDialog is a reusable component for displaying a button that opens a confirmation dialog
 * @param buttonText - the text displayed on the button
 * @param buttonTitle - the title attribute for the button
 * @param alertDialogText - the main text of the alert dialog
 * @param alertDialogDescription - the description text of the alert dialog
 * @param alertDialogCancelText - the text for the cancel button in the alert dialog
 * @param alertDialogContinueText - the text for the continue button in the alert dialog
 * @param buttonOnClick - the function to call when the continue button is clicked
 * @param buttonVariant - the variant of the button
 * @param disabled - whether the button is disabled
 * @param buttonClassName - additional CSS classes for the button
 * @returns
 */
export function ButtonDialog({
	children,
	buttonText,
	buttonTitle,
	alertDialogText,
	alertDialogDescription,
	alertDialogCancelText,
	alertDialogContinueText,
	buttonOnClick,
	buttonVariant = 'default',
	disabled,
	buttonClassName
}: ButtonDialogProps) {
	const { t } = useTranslation()

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className={buttonClassName} variant={buttonVariant} title={buttonTitle}>
					{buttonText ?? t('defaults.buttonText')}
					{children ?? null}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{alertDialogText ?? t('defaults.buttonAlertTitle')}</AlertDialogTitle>
					<AlertDialogDescription>{alertDialogDescription ?? t('defaults.buttonAlertDescription')}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					{alertDialogCancelText !== '' ? (
						<AlertDialogCancel title={t('actions.cancel')}>{alertDialogCancelText ?? t('actions.cancel')}</AlertDialogCancel>
					) : (
						<></>
					)}
					<AlertDialogAction
						title={t('actions.continue')} // eslint-disable-next-line
						onClick={buttonOnClick}
						disabled={disabled}
					>
						{alertDialogContinueText ?? t('actions.continue')}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
