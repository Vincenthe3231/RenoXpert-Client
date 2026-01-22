/**
 * Maps country calling codes to flag image file codes and country names
 */
export const COUNTRY_CODES = [
    { code: '60', name: 'Malaysia', flag: 'my' },
    { code: '65', name: 'Singapore', flag: 'sg' },
    { code: '61', name: 'Australia', flag: 'au' },
    { code: '86', name: 'China', flag: 'cn' },
    { code: '91', name: 'India', flag: 'in' },
    { code: '966', name: 'Saudi Arabia', flag: 'sa' },
    { code: '44', name: 'United Kingdom', flag: 'en' },
    { code: '33', name: 'France', flag: 'fr' },
] as const

const COUNTRY_CODE_TO_FLAG_MAP: Record<string, string> = {
    '60': 'my',  // Malaysia
    '65': 'sg',  // Singapore
    '61': 'au',  // Australia
    '86': 'cn',  // China
    '91': 'in',  // India
    '966': 'sa', // Saudi Arabia
    '44': 'en',  // UK
    '33': 'fr',  // France
};

/**
 * Gets the flag image path for a given country calling code
 * @param countryCode - The country calling code (e.g., "60", "65", "61")
 * @returns The path to the flag image, or null if no flag is available for the code
 */
export function getFlagPath(countryCode: string | null | undefined): string | null {
    if (!countryCode) return null;
    
    const flagCode = COUNTRY_CODE_TO_FLAG_MAP[countryCode];
    return flagCode ? `/images/flag/icon-flag-${flagCode}.svg` : null;
}

