/**
 * Business Rules and Constants
 * 
 * This file contains all hardcoded business values used throughout the dashboard.
 * Centralizing these values ensures consistency and makes updates easier.
 */

export const BUSINESS_RULES = {
  // Investment amounts per physician type
  FOUNDING_INVESTMENT: 600000,      // Founding physician investment
  ADDITIONAL_INVESTMENT: 750000,    // Additional physician investment

  // MSO fee percentages (as decimals)
  FOUNDING_MSO_FEE: 0.37,          // 37% for founding physicians
  ADDITIONAL_MSO_FEE: 0.40,        // 40% for additional physicians

  // Equity percentages (as decimals)
  FOUNDING_EQUITY: 0.10,           // 10% equity for founding physicians
  ADDITIONAL_EQUITY: 0.05,         // 5% equity for additional physicians
} as const;

/**
 * Helper Functions
 */

/**
 * Get MSO fee rate based on physician type
 */
export function getMSOFee(foundingToggle: boolean): number {
  return foundingToggle ? BUSINESS_RULES.FOUNDING_MSO_FEE : BUSINESS_RULES.ADDITIONAL_MSO_FEE;
}

/**
 * Get equity share based on physician type
 */
export function getEquityShare(foundingToggle: boolean): number {
  return foundingToggle ? BUSINESS_RULES.FOUNDING_EQUITY : BUSINESS_RULES.ADDITIONAL_EQUITY;
}

/**
 * Calculate total seed capital based on physician configuration
 */
export function calculateSeedCapital(foundingToggle: boolean, additionalPhysicians: number): number {
  const foundingCapital = foundingToggle ? BUSINESS_RULES.FOUNDING_INVESTMENT : 0;
  const additionalCapital = additionalPhysicians * BUSINESS_RULES.ADDITIONAL_INVESTMENT;
  return foundingCapital + additionalCapital;
}

/**
 * Format MSO fee as percentage string
 */
export function formatMSOFee(foundingToggle: boolean): string {
  return `${getMSOFee(foundingToggle) * 100}%`;
}

/**
 * Format equity share as percentage string
 */
export function formatEquityShare(foundingToggle: boolean): string {
  return `${getEquityShare(foundingToggle) * 100}%`;
}

