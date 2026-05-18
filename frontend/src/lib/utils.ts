import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(value: string | null | undefined, maxLength = 160) {
  const normalized = (value ?? '').replace(/\s+/g, ' ').trim()
  if (!normalized || normalized.length <= maxLength) {
    return normalized
  }

  const truncated = normalized.slice(0, maxLength).trim()
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  if (lastSpaceIndex <= 0) {
    return `${truncated}...`
  }

  return `${truncated.slice(0, lastSpaceIndex)}...`
}
