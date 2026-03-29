/**
 * Formatting utilities for pt-BR locale
 * Currency (BRL), dates, and numbers follow Brazilian standards.
 */

/**
 * Format a number as Brazilian Real (R$)
 * @param {number|string} value
 * @param {object} options
 * @param {boolean} options.showSymbol - Whether to show "R$" prefix (default: true)
 * @param {number} options.decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatBRL(value, { showSymbol = true, decimals = 2 } = {}) {
  const num = Number(value) || 0
  const formatted = num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return showSymbol ? `R$ ${formatted}` : formatted
}

/**
 * Format a date to Brazilian format (DD/MM/YYYY HH:mm)
 * @param {string|Date} dateValue
 * @param {object} options
 * @param {boolean} options.showTime - Whether to include time (default: true)
 * @returns {string}
 */
export function formatDateBR(dateValue, { showTime = true } = {}) {
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return '—'
  
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    ...(showTime ? { timeStyle: 'short' } : {}),
  })
}

/**
 * Format a number following Brazilian standards (dot for thousands, comma for decimals)
 * @param {number|string} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumberBR(value, decimals = 2) {
  const num = Number(value) || 0
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
