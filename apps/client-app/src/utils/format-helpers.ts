/**
 * Formats an IC (Identity Card) number from yymmddaabbbb to yymmdd-aa-bbbb
 * @param ic - The IC number string in format yymmddaabbbb (12 digits)
 * @returns Formatted IC number in format yymmdd-aa-bbbb, or the original string if invalid
 */
export function formatIC(ic: string | null | undefined): string {
    if (!ic) return '';
    
    // Remove any existing dashes or spaces
    const cleaned = ic.replace(/[-\s]/g, '');
    
    // Check if it's exactly 12 digits
    if (!/^\d{12}$/.test(cleaned)) {
        // If not 12 digits, return original (might be already formatted or invalid)
        return ic;
    }
    
    // Format: yymmdd-aa-bbbb
    const yymmdd = cleaned.substring(0, 6);
    const aa = cleaned.substring(6, 8);
    const bbbb = cleaned.substring(8, 12);
    
    return `${yymmdd}-${aa}-${bbbb}`;
}

