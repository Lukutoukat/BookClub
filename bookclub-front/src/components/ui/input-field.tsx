import * as React from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

export const inputFieldStyles =
	'flex h-12 w-full min-w-0 items-center rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50'

type InputFieldProps = React.ComponentProps<'div'> & {
	asChild?: boolean
}

export const InputField = ({ asChild = false, className, ...props }: InputFieldProps) => {
	const Component = asChild ? Slot.Root : 'div'
	return <Component data-slot="input-field" className={cn(inputFieldStyles, className)} {...props} />
}