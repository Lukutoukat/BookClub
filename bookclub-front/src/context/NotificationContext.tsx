import SuccessMessageDisplay from '@/components/successMessageDisplay'
import { useCallback, useContext, useEffect, useState, type ReactNode, createContext } from 'react'

interface NotificationContextType {
  showSuccess: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState<string | undefined>(undefined)

  const showSuccess = useCallback((msg: string) => {
    setMessage(msg)
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(undefined), 5000)
    return () => clearTimeout(t)
  }, [message])

  return (
    <NotificationContext.Provider value={{ showSuccess }}>
      {children}
      <SuccessMessageDisplay message={message} />
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