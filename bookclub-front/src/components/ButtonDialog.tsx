import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

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
    | "default"
    | "link"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | null
    | undefined
  disabled?: boolean
  buttonClassName?: string
}

export function ButtonDialog({
  children,
  buttonText = "Click me",
  buttonTitle,
  alertDialogText = "Are you absolutely sure?",
  alertDialogDescription = "This action needs to be accepted by clicking continue.",
  alertDialogCancelText = "Cancel",
  alertDialogContinueText = "Continue",
  buttonOnClick,
  buttonVariant = "default",
  disabled,
  buttonClassName,
}: ButtonDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className={buttonClassName}
          variant={buttonVariant}
          title={buttonTitle}
        >
          {buttonText}
          {children ?? null}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertDialogText}</AlertDialogTitle>
          <AlertDialogDescription>
            {alertDialogDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {alertDialogCancelText !== "" ? (
            <AlertDialogCancel title="cancel">
              {alertDialogCancelText}
            </AlertDialogCancel>
          ) : (
            <></>
          )}
          {
            // eslint-disable-next-line
          } <AlertDialogAction title="continue" onClick={buttonOnClick} disabled={disabled}
          >
            {alertDialogContinueText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
