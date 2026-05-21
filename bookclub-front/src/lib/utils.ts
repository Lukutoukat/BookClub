// @ts-expect-error
import { clsx, type ClassValue } from "clsx"
// @ts-expect-error
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
