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
	buttonText = 'Click me',
	buttonTitle,
	alertDialogText = 'Are you absolutely sure?',
	alertDialogDescription = 'This action needs to be accepted by clicking continue.',
	alertDialogCancelText = 'Cancel',
	alertDialogContinueText = 'Continue',
	buttonOnClick,
	buttonVariant = 'default',
	disabled,
	buttonClassName
}: ButtonDialogProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className={buttonClassName} variant={buttonVariant} title={buttonTitle}>
					{buttonText}
					{children ?? null}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{alertDialogText}</AlertDialogTitle>
					<AlertDialogDescription>{alertDialogDescription}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					{alertDialogCancelText !== '' ? (
						<AlertDialogCancel title="cancel">{alertDialogCancelText}</AlertDialogCancel>
					) : (
						<></>
					)}
					<AlertDialogAction
						title="continue" // eslint-disable-next-line
						onClick={buttonOnClick}
						disabled={disabled}
					>
						{alertDialogContinueText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
