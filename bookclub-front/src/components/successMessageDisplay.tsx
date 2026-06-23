import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

type successMessageProps = {
  message?: string
}

const SuccessMessageDisplay = ({ message }: successMessageProps) => {
  const [localMessage, setLocalMessage] = useState<string | undefined>(message)
  const [isLeaving, setIsLeaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (message) {
      setLocalMessage(message)
      setIsLeaving(false)
    } else if (localMessage) {
      setIsLeaving(true)
      const timeout = setTimeout(() => {
        setLocalMessage(undefined)
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [message, localMessage])

  if (!localMessage || !mounted) {
    return null
  }

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
      <Alert className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
            <AlertTitle className="font-semibold text-emerald-700 m-0 pb-0 leading-none">
              Confirmation:
            </AlertTitle>
            <AlertDescription className="text-emerald-600 leading-normal">
              {localMessage}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>,
    document.body
  )
}

export default SuccessMessageDisplay
