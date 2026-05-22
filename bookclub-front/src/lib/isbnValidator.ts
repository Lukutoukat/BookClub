/**
 * Validates an ISBN string (10 or 13 digits, ignoring dashes)
 * @param isbn - The ISBN string, may contain dashes
 * @returns true if valid ISBN, false otherwise
 */
export const isValidISBN = (isbn: string): boolean => {
  const cleanISBN = isbn.replace(/[-\s]/g, '')

  // Must be only numbers, 10 or 13 digits
  if (!/^\d{10}$|^\d{13}$/.test(cleanISBN)) {
    return false
  }

  if (cleanISBN.length === 10) {
    let sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanISBN[i], 10) * (10 - i)
    }
    return sum % 11 === 0
  }

  if (cleanISBN.length === 13) {
    let sum = 0
    for (let i = 0; i < 13; i++) {
      const digit = parseInt(cleanISBN[i], 10)
      sum += digit * (i % 2 === 0 ? 1 : 3)
    }
    return sum % 10 === 0
  }

  return false
}

/**
 * Formats an ISBN string with dashes according to the format
 * @param isbn - The ISBN string (should be clean numbers only)
 * @returns Formatted ISBN with dashes
 */
export const formatISBN = (isbn: string): string => {
  const cleanISBN = isbn.replace(/[-\s]/g, '')

  if (cleanISBN.length === 10) {
    // ISBN-10 format: X-XXX-XXXXX-X
    return `${cleanISBN.slice(0, 1)}-${cleanISBN.slice(1, 4)}-${cleanISBN.slice(4, 9)}-${cleanISBN.slice(9)}`
  }

  if (cleanISBN.length === 13) {
    // ISBN-13 format: XXX-X-XXX-XXXXX-X
    return `${cleanISBN.slice(0, 3)}-${cleanISBN.slice(3, 4)}-${cleanISBN.slice(4, 7)}-${cleanISBN.slice(7, 12)}-${cleanISBN.slice(12)}`
  }

  return isbn
}

/**
 * Removes all dashes from ISBN
 * @param isbn - The ISBN string with possible dashes
 * @returns Clean ISBN string (numbers only)
 */
export const cleanISBN = (isbn: string): string => {
  return isbn.replace(/[-\s]/g, '')
}