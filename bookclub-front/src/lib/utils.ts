// @ts-ignore
import { clsx, type ClassValue } from "clsx"
// @ts-ignore
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
