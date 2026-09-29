import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, OctagonAlertIcon } from 'lucide-react'
import type { Notification } from '@/types.ts'

type NotificationToastProps = {
	notification?: Notification
}

const variantSettings = {
	success: {
		text: 'Confirmation',
		borderColor: 'border-emerald-100',
		bgColor: 'bg-emerald-600/70',
		darkBgColor: 'bg-emerald-800/70',
		textColor: 'text-emerald-100',
		darkTextColor: 'text-emerald-300',
		icon: CheckCircle2
	},
	error: {
		text: 'Error',
		borderColor: 'border-red-100',
		bgColor: 'bg-red-600/70',
		darkBgColor: 'bg-red-800/70',
		textColor: 'text-red-100',
		darkTextColor: 'text-red-300',
		icon: OctagonAlertIcon
	}
}

const NotificationToast = ({ notification }: NotificationToastProps) => {
	const [localNotification, setLocalNotification] = useState<Notification | undefined>(notification)
	const [isLeaving, setIsLeaving] = useState(false)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (notification) {
			setLocalNotification(notification)
			setIsLeaving(false)
		} else if (localNotification) {
			setIsLeaving(true)
			const timeout = setTimeout(() => {
				setLocalNotification(undefined)
			}, 300)

			return () => clearTimeout(timeout)
		}
	}, [notification, localNotification])

	if (!localNotification || !mounted) {
		return null
	}

	const settings = variantSettings[localNotification.type];
	const Icon = settings.icon;

	return createPortal(
		<div
			className={`
				fixed z-[9999] 
				bottom-24 right-4 left-4 
				md:bottom-6 md:right-6 md:left-auto
				w-auto max-w-sm md:max-w-md 
				transition-all duration-300 ease-in-out
				${
					isLeaving
						? 'opacity-0 translate-y-4 scale-95 pointer-events-none'
						: 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-5'
				}
			`}
		>
			<Alert className={`flex items-center justify-between gap-4 rounded-2xl border ${settings.borderColor} ${settings.bgColor} dark:${settings.darkBgColor} p-4 shadow-lg backdrop-blur-md`}>
				<div className={`flex items-center gap-3 ${settings.textColor} dark:${settings.darkTextColor}`}>
					<Icon className={`h-5 w-5 shrink-0`} />
					<div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
						<AlertTitle className="font-semibold m-0 pb-0 leading-none">
							{settings.text}
						</AlertTitle>
						<AlertDescription className={`leading-normal ${settings.textColor} dark:${settings.darkTextColor}`}>
							{localNotification.message}
						</AlertDescription>
					</div>
				</div>
			</Alert>
		</div>,
		document.body
	)
}

export default NotificationToast
