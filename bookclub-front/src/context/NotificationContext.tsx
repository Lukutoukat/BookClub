import NotificationToast from '@/components/NotificationToast.tsx'
import { useCallback, useContext, useEffect, useState, type ReactNode, createContext } from 'react'
import type { Notification } from '@/types.ts'

interface NotificationContextType {
	showSuccess: (message: string) => void
	showError: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const [notification, setNotification] = useState<Notification | undefined>(undefined)

	const showSuccess = useCallback((msg: string) => {
		setNotification({message: msg, type: 'success'})
	}, [])

	const showError = useCallback((msg: string)=> {
		setNotification({message: msg, type: 'error'})
	}, [])

	useEffect(() => {
		if (!notification) return
		const t = setTimeout(() => setNotification(undefined), 5000)
		return () => clearTimeout(t)
	}, [notification])

	return (
		<NotificationContext.Provider value={{ showSuccess, showError }}>
			{children}
			<NotificationToast notification={notification} />
		</NotificationContext.Provider>
	)
}

export const useNotification: () => NotificationContextType = () => {
	const context = useContext(NotificationContext)
	if (context === undefined) {
		throw new Error('useNotification must be used within a NotificationProvider')
	}
	return context
}
