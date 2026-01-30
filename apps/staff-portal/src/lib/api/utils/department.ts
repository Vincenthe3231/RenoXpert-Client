/**
 * Maps frontend department values (snake_case/lowercase) to backend format (capitalized with spaces)
 * Backend expects: "Owner Sales", "Renovation", "Technician", "Finance & Account"
 */
export function mapDepartmentToBackendFormat(frontendDepartment: string): string {
    const departmentMap: Record<string, string> = {
        "owner_sales": "Owner Sales",
        "renovation": "Renovation",
        "technician": "Technician",
        "finance_account": "Finance & Account",
    }
    
    // Return mapped value if exists, otherwise return as-is (fallback)
    return departmentMap[frontendDepartment] || frontendDepartment
}

/**
 * Valid department values that the backend accepts
 */
export const VALID_DEPARTMENTS = [
    "Owner Sales",
    "Renovation",
    "Technician",
    "Finance & Account",
] as const

export type Department = typeof VALID_DEPARTMENTS[number]

