import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useTranslation } from 'react-i18next'

type errorMessageProps = {
	message: string
	remove: () => void
}
const errorMessageDisplay = ({ message, remove }: errorMessageProps) => {
	const { t } = useTranslation()

	if (!message) {
		return null
	}
	return (
		<>
			<Alert variant="destructive" className="max-w-full">
				<AlertCircleIcon />
				<AlertTitle>{t('labels.error')}</AlertTitle>
				<AlertDescription>{message}</AlertDescription>
				<AlertAction>
					<Button size="xs" variant="default" onClick={remove}>
						{t('actions.close')}
					</Button>
				</AlertAction>
			</Alert>
		</>
	)
}

export default errorMessageDisplay
