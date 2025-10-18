/**
 * Global formatting utilities for the Pillars Financial Dashboard
 * All currency values are rounded to whole dollars (no cents)
 */

/**
 * Format a number as currency with no decimal places
 * @param value - The numeric value to format
 * @param compact - If true, uses K/M notation for large numbers
 * @returns Formatted currency string (e.g., "$1,234" or "$1M")
 */
export function formatCurrency(value: number, compact = false): string {
  const roundedValue = Math.round(value);
  
  if (compact) {
    if (Math.abs(roundedValue) >= 1000000) {
      return `$${(roundedValue / 1000000).toFixed(0)}M`;
    }
    if (Math.abs(roundedValue) >= 1000) {
      return `$${(roundedValue / 1000).toFixed(0)}k`;
    }
    return `$${roundedValue.toLocaleString('en-US')}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedValue);
}

/**
 * Format a percentage value
 * @param value - The numeric value (e.g., 12.5 for 12.5%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "12.5%")
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators
 * @param value - The numeric value to format
 * @returns Formatted number string (e.g., "1,234")
 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

