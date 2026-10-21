import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatToDDMMYY(dateString?: string | null): string {
  if (!dateString) return '-'
  try {
    const trimmed = String(dateString).trim()
    if (!trimmed || trimmed === '-' || trimmed === 'null' || trimmed === 'undefined') return '-'
    
    // Check if already in DD/MM/YYYY or DD-MM-YYYY format
    if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(trimmed)) {
      return trimmed.replace(/[\-\.]/g, '/')
    }

    // Check if ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const parts = trimmed.split('T')[0].split('-')
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }

    const d = new Date(trimmed)
    if (isNaN(d.getTime())) return trimmed
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return dateString || '-'
  }
}