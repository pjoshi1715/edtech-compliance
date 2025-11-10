/**
 * Generate a unique ID for data elements and inventories
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Format a date and time for display
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}

/**
 * Get a readable label from an enum value
 */
export function humanizeEnumValue(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Count unique third-party vendors across all data elements
 */
export function countUniqueVendors(elements: { thirdPartyRecipients: { name: string }[] }[]): number {
  const vendorNames = new Set<string>()
  elements.forEach((element) => {
    element.thirdPartyRecipients.forEach((recipient) => {
      if (recipient.name.trim()) {
        vendorNames.add(recipient.name.toLowerCase().trim())
      }
    })
  })
  return vendorNames.size
}
