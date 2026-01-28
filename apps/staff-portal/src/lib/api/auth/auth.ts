import axios from 'axios'
import {
    LoginInputSchema,
    LoginResponseSchema,
    MeResponseSchema,
    userListSchema,
    userSchema,
    LoginInput,
    StaffUser,
    GetUsersParams,
    UserListResponse,
    User,
} from './auth.schemas'
import { API_ROUTES } from '../constants'

export async function login(payload: LoginInput): Promise<User> {
    LoginInputSchema.parse(payload)

    const { data } = await axios.post(API_ROUTES.AUTH.LOGIN, payload)
    const result = LoginResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Login response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid login response: ${result.error.message}`)
    }
    return result.data.data.user
}

export async function getMe(): Promise<User | null> {
    const { data } = await axios.get(API_ROUTES.AUTH.ME)
    
    const result = MeResponseSchema.safeParse(data)
    if (!result.success) {
        console.error('Me response validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid me response: ${result.error.message}`)
    }
    // Handle both response formats: nested data.user or null
    // The TypeScript error happens because result.data is inferred from the Zod parsed shape,
    // but its type for `.data` is `{}` or unknown—so TS doesn't know that .user or .rejectionReason exist.
    // This makes property access like result.data.data.user unsafe in TS's view.
    // To fix, we can use `as any` or check for keys in a type-safe way.

    const responseData = (result.data as any).data
    if (responseData && typeof responseData === 'object' && 'user' in responseData) {
        const user: User = responseData.user
        // Optionally attach rejectionReason if present
        if ('rejectionReason' in responseData && responseData.rejectionReason) {
            (user as User & { rejectionReason?: string }).rejectionReason = responseData.rejectionReason
        }
        return user
    }
    return null
}

export async function logout(): Promise<void> {
    await axios.post(API_ROUTES.AUTH.LOGOUT)
}

export async function resubmit(): Promise<void> {
    await axios.post(API_ROUTES.AUTH.RESUBMIT)
}

export async function deactivateUser(identifier: string): Promise<User> {
    // Backend now accepts both integer ID and UUID string directly
    try {
        const { data } = await axios.post(API_ROUTES.AUTH.DEACTIVATE_USER(identifier))
        // Handle response format: { success: true, message: "...", data: { user: {...} } }
        // Also support legacy formats: { message: "...", data: { user: {...} } } or { user: {...} }
        const userData = data?.data?.user || data?.user || data
        const result = userSchema.safeParse(userData)
        if (!result.success) {
            console.error('Deactivate user response validation failed:', result.error.issues)
            console.error('Received data:', JSON.stringify(userData, null, 2))
            throw new Error(`Invalid deactivate user response: ${result.error.message}`)
        }
        return result.data
    } catch (error: any) {
        throw error
    }
}

export async function activateUser(identifier: string): Promise<User> {
    // Backend now accepts both integer ID and UUID string directly
    try {
        const { data } = await axios.post(API_ROUTES.AUTH.ACTIVATE_USER(identifier))
        // Handle response format: { success: true, message: "...", data: { user: {...} } }
        // Also support legacy formats: { message: "...", data: { user: {...} } } or { user: {...} }
        const userData = data?.data?.user || data?.user || data
        const result = userSchema.safeParse(userData)
        if (!result.success) {
            console.error('Activate user response validation failed:', result.error.issues)
            console.error('Received data:', JSON.stringify(userData, null, 2))
            throw new Error(`Invalid activate user response: ${result.error.message}`)
        }
        return result.data
    } catch (error: any) {
        throw error
    }
}

export async function getUsers(params?: GetUsersParams): Promise<UserListResponse> {
    const { data } = await axios.get(API_ROUTES.AUTH.USERS, { params })
    const result = userListSchema.safeParse(data)
    if (!result.success) {
        console.error('User list data validation failed:', result.error.issues)
        console.error('Received data:', JSON.stringify(data, null, 2))
        throw new Error(`Invalid user list data: ${result.error.message}`)
    }
    return result.data
}

export async function getUser(id: string): Promise<User> {
    try {
        const { data } = await axios.get(API_ROUTES.AUTH.USER(id))
        // Handle multiple response formats:
        // 1. { message: "...", data: { user: {...} } } - new backend format
        // 2. { user: {...} } - old format
        // 3. Direct user object
        const userData = data?.data?.user || data?.user || data
        const result = userSchema.safeParse(userData)
        if (!result.success) {
            console.error('User data validation failed:', result.error.issues)
            console.error('Received data:', JSON.stringify(userData, null, 2))
            throw new Error(`Invalid user data: ${result.error.message}`)
        }
        return result.data
    } catch (error: any) {
        throw error
    }
}

/**
 * Get single owner by ID (for staff users who don't have permission to access /api/auth/users/{id})
 * Uses /api/owners/{id} which calls Laravel's /owners/{id} endpoint with staff-friendly permissions
 */
export async function getOwner(id: string): Promise<User> {
    try {
        const { data } = await axios.get(`/api/owners/${id}`)
        
        const ownerData = data?.data?.owner || data?.owner || data?.data || data
        
        if (!ownerData) {
            throw new Error('Owner data not found in response')
        }
        
        const profileFields = {
            salutation: ownerData.salutation ?? null,
            ic: ownerData.ic ?? null,
            address1: ownerData.address1 ?? null,
            address2: ownerData.address2 ?? null,
            city: ownerData.city ?? null,
            state: ownerData.state ?? null,
            postcode: ownerData.postcode ?? null,
        }
        
        // Extract phone and country code - handle both camelCase and snake_case
        // Backend may return phoneNo/countryCode (camelCase) or phone_no/country_code (snake_case)
        const phone_no = ownerData.phone_no ?? ownerData.phoneNo ?? null
        const country_code = ownerData.country_code ?? ownerData.countryCode ?? null
        
        const {
            salutation,
            ic,
            address1,
            address2,
            city,
            state,
            postcode,
            phone_no: _phone_no, // Remove from userFields
            country_code: _country_code, // Remove from userFields
            phoneNo: _phoneNo, // Remove from userFields (in case backend returns camelCase)
            countryCode: _countryCode, // Remove from userFields (in case backend returns camelCase)
            ...userFields
        } = ownerData
        
        // Transform to camelCase for phone and country code
        const transformedUser = {
            ...userFields,
            phoneNo: phone_no ?? null, // Use extracted phone number
            countryCode: country_code ?? null, // Use extracted country code
            profile: profileFields,
        }
        
        const result = userSchema.safeParse(transformedUser)
        if (!result.success) {
            console.error('Owner data validation failed:', result.error.issues)
            console.error('Received data:', JSON.stringify(data, null, 2))
            console.error('Owner data:', JSON.stringify(ownerData, null, 2))
            console.error('Transformed data:', JSON.stringify(transformedUser, null, 2))
            throw new Error(`Invalid owner data: ${result.error.message}`)
        }
        return result.data
    } catch (error: any) {
        throw error
    }
}

/**
 * Get owners list (for staff users who don't have permission to access /users endpoint)
 * Uses /api/owners which calls Laravel's /owners endpoint with staff-friendly permissions
 */
export async function getOwners(params?: GetUsersParams): Promise<UserListResponse> {
    // Build params compatible with /api/owners endpoint
    // The owners endpoint expects: filter[status], filter[search], page, per_page
    const ownersParams: Record<string, any> = {}
    
    if (params?.status) {
        ownersParams['filter[status]'] = params.status
    }
    if (params?.search) {
        ownersParams['filter[search]'] = params.search
    }
    if (params?.page) {
        ownersParams.page = params.page
    }
    if (params?.perPage) {
        ownersParams.per_page = params.perPage
    }
    
    const { data } = await axios.get('/api/owners', { params: ownersParams })
    
    // Debug: Log raw backend response in development to see what fields are actually returned
    if (process.env.NODE_ENV === 'development' && data?.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log('Raw backend owners list response (first item):', JSON.stringify(data.data[0], null, 2))
    }
    
    // Transform the data to match the expected schema structure
    // Backend returns profile fields (salutation, ic, address1, etc.) at top level,
    // but schema expects them nested in a 'profile' object
    const transformedData = {
        ...data,
        data: Array.isArray(data.data) ? data.data.map((item: any) => {
            // Extract profile fields that should be nested
            const profileFields = {
                salutation: item.salutation ?? null,
                ic: item.ic ?? null,
                address1: item.address1 ?? null,
                address2: item.address2 ?? null,
                city: item.city ?? null,
                state: item.state ?? null,
                postcode: item.postcode ?? null,
            }
            
            // Extract phone and country code - handle both snake_case and camelCase
            // Backend may return phone_no/country_code (snake_case) or phoneNo/countryCode (camelCase)
            // Check all possible field names the backend might use
            const phone_no = item.phone_no ?? item.phoneNo ?? item.phone_number ?? item.phone ?? null
            const country_code = item.country_code ?? item.countryCode ?? item.country ?? null
            
            // Debug: Log if phone/country code is missing (only in development)
            if (process.env.NODE_ENV === 'development' && !phone_no && item.id) {
                console.warn('Owner missing phone_no in response:', {
                    id: item.id,
                    uuid: item.uuid,
                    name: item.name,
                    availableFields: Object.keys(item),
                    phone_no: item.phone_no,
                    phoneNo: item.phoneNo,
                    country_code: item.country_code,
                    countryCode: item.countryCode,
                })
            }
            
            // Remove profile fields and phone/country code from top level
            const {
                salutation,
                ic,
                address1,
                address2,
                city,
                state,
                postcode,
                phone_no: _phone_no, // Backend returns snake_case
                country_code: _country_code, // Backend returns snake_case
                phoneNo: _phoneNo, // In case backend returns camelCase
                countryCode: _countryCode, // In case backend returns camelCase
                ...userFields
            } = item
            
            return {
                ...userFields,
                phoneNo: phone_no ?? null, // Transform phone_no to phoneNo
                countryCode: country_code ?? null, // Transform country_code to countryCode
                profile: profileFields,
            }
        }) : [],
    }
    
    // Now validate with the standard userListSchema
    const userListResult = userListSchema.safeParse(transformedData)
    if (userListResult.success) {
        return userListResult.data
    }
    
    // If validation fails, log detailed error information
    console.error('Owner list data validation failed:', userListResult.error.issues)
    console.error('Received data:', JSON.stringify(data, null, 2))
    console.error('Transformed data:', JSON.stringify(transformedData, null, 2))
    throw new Error(`Invalid owner list data: ${userListResult.error.message}`)
}

/**
 * Get vendors list (for staff users who don't have permission to access /users endpoint)
 * Uses /api/vendors which calls Laravel's /vendors endpoint with staff-friendly permissions
 */
export async function getVendors(params?: GetUsersParams): Promise<UserListResponse> {
    // Build params compatible with /api/vendors endpoint
    // The vendors endpoint expects: filter[status], filter[search], page, per_page
    const vendorsParams: Record<string, any> = {}
    
    if (params?.status) {
        vendorsParams['filter[status]'] = params.status
    }
    if (params?.search) {
        vendorsParams['filter[search]'] = params.search
    }
    if (params?.page) {
        vendorsParams.page = params.page
    }
    if (params?.perPage) {
        vendorsParams.per_page = params.perPage
    }
    
    const { data } = await axios.get('/api/vendors', { params: vendorsParams })
    
    // Debug: Log raw backend response in development to see what fields are actually returned
    if (process.env.NODE_ENV === 'development' && data?.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log('Raw backend vendors list response (first item):', JSON.stringify(data.data[0], null, 2))
    }
    
    // Transform the data to match the expected schema structure
    // Backend returns profile fields (salutation, ic, address1, etc.) at top level,
    // but schema expects them nested in a 'profile' object
    const transformedData = {
        ...data,
        data: Array.isArray(data.data) ? data.data.map((item: any) => {
            // Extract profile fields that should be nested
            const profileFields = {
                salutation: item.salutation ?? null,
                ic: item.ic ?? null,
                address1: item.address1 ?? null,
                address2: item.address2 ?? null,
                city: item.city ?? null,
                state: item.state ?? null,
                postcode: item.postcode ?? null,
            }
            
            // Extract phone and country code - handle both snake_case and camelCase
            const phone_no = item.phone_no ?? item.phoneNo ?? item.phone_number ?? item.phone ?? null
            const country_code = item.country_code ?? item.countryCode ?? item.country ?? null
            
            // Debug: Log if phone/country code is missing (only in development)
            if (process.env.NODE_ENV === 'development' && !phone_no && item.id) {
                console.warn('Vendor missing phone_no in response:', {
                    id: item.id,
                    uuid: item.uuid,
                    name: item.name,
                    availableFields: Object.keys(item),
                    phone_no: item.phone_no,
                    phoneNo: item.phoneNo,
                    country_code: item.country_code,
                    countryCode: item.countryCode,
                })
            }
            
            // Remove profile fields and phone/country code from top level
            const {
                salutation,
                ic,
                address1,
                address2,
                city,
                state,
                postcode,
                phone_no: _phone_no,
                country_code: _country_code,
                phoneNo: _phoneNo,
                countryCode: _countryCode,
                ...userFields
            } = item
            
            return {
                ...userFields,
                phoneNo: phone_no ?? null,
                countryCode: country_code ?? null,
                profile: profileFields,
            }
        }) : [],
    }
    
    // Now validate with the standard userListSchema
    const userListResult = userListSchema.safeParse(transformedData)
    if (userListResult.success) {
        return userListResult.data
    }
    
    // If validation fails, log detailed error information
    console.error('Vendor list data validation failed:', userListResult.error.issues)
    console.error('Received data:', JSON.stringify(data, null, 2))
    console.error('Transformed data:', JSON.stringify(transformedData, null, 2))
    throw new Error(`Invalid vendor list data: ${userListResult.error.message}`)
}

/**
 * Update owner by ID
 * Uses PUT /api/owners/{id} which calls Laravel's PUT /owners/{id} endpoint
 * 
 * @param id - Owner ID (integer) or UUID string
 * @param data - Partial owner data (camelCase fields will be converted to snake_case for backend)
 */
export async function updateOwner(
    id: string,
    data: {
        name?: string
        email?: string
        phoneNo?: string
        countryCode?: string
        salutation?: string
        ic?: string
        address1?: string
        address2?: string
        city?: string
        state?: string
        postcode?: string
    }
): Promise<User> {
    try {
        // Transform camelCase to snake_case for backend
        const backendData: Record<string, any> = {}
        if (data.name !== undefined) backendData.name = data.name
        if (data.email !== undefined) backendData.email = data.email
        if (data.phoneNo !== undefined) backendData.phone_no = data.phoneNo
        if (data.countryCode !== undefined) backendData.country_code = data.countryCode
        if (data.salutation !== undefined) backendData.salutation = data.salutation
        if (data.ic !== undefined) backendData.ic = data.ic
        if (data.address1 !== undefined) backendData.address_1 = data.address1
        if (data.address2 !== undefined) backendData.address_2 = data.address2
        if (data.city !== undefined) backendData.city = data.city
        if (data.state !== undefined) backendData.state = data.state
        if (data.postcode !== undefined) backendData.postcode = data.postcode

        const { data: response } = await axios.put(`/api/owners/${id}`, backendData)

        // Backend returns: { message: "...", data: { owner: {...} } }
        const ownerData = response?.data?.owner || response?.owner || response?.data || response

        if (!ownerData) {
            throw new Error('Owner data not found in response')
        }

        // Transform profile fields (same as getOwner)
        const profileFields = {
            salutation: ownerData.salutation ?? null,
            ic: ownerData.ic ?? null,
            address1: ownerData.address1 ?? null,
            address2: ownerData.address2 ?? null,
            city: ownerData.city ?? null,
            state: ownerData.state ?? null,
            postcode: ownerData.postcode ?? null,
        }

        // Extract phone and country code - handle both camelCase and snake_case
        // Backend may return phoneNo/countryCode (camelCase) or phone_no/country_code (snake_case)
        const phone_no = ownerData.phone_no ?? ownerData.phoneNo ?? null
        const country_code = ownerData.country_code ?? ownerData.countryCode ?? null
        
        const {
            salutation,
            ic,
            address1,
            address2,
            city,
            state,
            postcode,
            phone_no: _phone_no, // Remove from userFields
            country_code: _country_code, // Remove from userFields
            phoneNo: _phoneNo, // Remove from userFields (in case backend returns camelCase)
            countryCode: _countryCode, // Remove from userFields (in case backend returns camelCase)
            ...userFields
        } = ownerData

        // Transform to camelCase for phone and country code
        const transformedUser = {
            ...userFields,
            phoneNo: phone_no ?? null, // Use extracted phone number
            countryCode: country_code ?? null, // Use extracted country code
            profile: profileFields,
        }

        const result = userSchema.safeParse(transformedUser)
        if (!result.success) {
            console.error('Update owner response validation failed:', result.error.issues)
            console.error('Received data:', JSON.stringify(response, null, 2))
            console.error('Owner data:', JSON.stringify(ownerData, null, 2))
            console.error('Transformed data:', JSON.stringify(transformedUser, null, 2))
            throw new Error(`Invalid owner data: ${result.error.message}`)
        }
        return result.data
    } catch (error: any) {
        // Handle backend error format: { error: "ERROR_CODE", message: "...", status: 400, fields?: {...} }
        if (error?.response?.data?.error) {
            const backendError = error.response.data
            const customError = new Error(backendError.message || 'Failed to update owner')
            ;(customError as any).status = backendError.status || error.response.status
            ;(customError as any).code = backendError.error
            ;(customError as any).fields = backendError.fields
            throw customError
        }
        throw error
    }
}

/**
 * Update vendor by ID
 * Uses PUT /api/vendors/{id} which calls Laravel's PUT /vendors/{id} endpoint
 * 
 * @param id - Vendor ID (integer) or UUID string
 * @param data - Partial vendor data (camelCase fields will be converted to snake_case for backend)
 */
export async function updateVendor(
    id: string,
    data: {
        name?: string
        email?: string
        phoneNo?: string
        countryCode?: string
        salutation?: string
        ic?: string
        address1?: string
        address2?: string
        city?: string
        state?: string
        postcode?: string
    }
): Promise<User> {
    try {
        // Transform camelCase to snake_case for backend
        const backendData: Record<string, any> = {}
        if (data.name !== undefined) backendData.name = data.name
        if (data.email !== undefined) backendData.email = data.email
        if (data.phoneNo !== undefined) backendData.phone_no = data.phoneNo
        if (data.countryCode !== undefined) backendData.country_code = data.countryCode
        if (data.salutation !== undefined) backendData.salutation = data.salutation
        if (data.ic !== undefined) backendData.ic = data.ic
        if (data.address1 !== undefined) backendData.address_1 = data.address1
        if (data.address2 !== undefined) backendData.address_2 = data.address2
        if (data.city !== undefined) backendData.city = data.city
        if (data.state !== undefined) backendData.state = data.state
        if (data.postcode !== undefined) backendData.postcode = data.postcode

        const { data: response } = await axios.put(`/api/vendors/${id}`, backendData)

        // Backend returns: { message: "...", data: { vendor: {...} } }
        const vendorData = response?.data?.vendor || response?.vendor || response?.data || response

        if (!vendorData) {
            throw new Error('Vendor data not found in response')
        }

        // Transform profile fields (same as getVendor)
        const profileFields = {
            salutation: vendorData.salutation ?? null,
            ic: vendorData.ic ?? null,
            address1: vendorData.address1 ?? null,
            address2: vendorData.address2 ?? null,
            city: vendorData.city ?? null,
            state: vendorData.state ?? null,
            postcode: vendorData.postcode ?? null,
        }

        // Extract phone and country code - handle both camelCase and snake_case
        // Backend may return phoneNo/countryCode (camelCase) or phone_no/country_code (snake_case)
        const phone_no = vendorData.phone_no ?? vendorData.phoneNo ?? null
        const country_code = vendorData.country_code ?? vendorData.countryCode ?? null
        
        const {
            salutation,
            ic,
            address1,
            address2,
            city,
            state,
            postcode,
            phone_no: _phone_no, // Remove from userFields
            country_code: _country_code, // Remove from userFields
            phoneNo: _phoneNo, // Remove from userFields (in case backend returns camelCase)
            countryCode: _countryCode, // Remove from userFields (in case backend returns camelCase)
            ...userFields
        } = vendorData

        // Transform to camelCase for phone and country code
        const transformedUser = {
            ...userFields,
            phoneNo: phone_no ?? null, // Use extracted phone number
            countryCode: country_code ?? null, // Use extracted country code
            profile: profileFields,
        }

        const result = userSchema.safeParse(transformedUser)
        if (!result.success) {
            console.error('Update vendor response validation failed:', result.error.issues)
            console.error('Received data:', JSON.stringify(response, null, 2))
            console.error('Vendor data:', JSON.stringify(vendorData, null, 2))
            console.error('Transformed data:', JSON.stringify(transformedUser, null, 2))
            throw new Error(`Invalid vendor data: ${result.error.message}`)
        }
        return result.data
    } catch (error: any) {
        // Handle backend error format: { error: "ERROR_CODE", message: "...", status: 400, fields?: {...} }
        if (error?.response?.data?.error) {
            const backendError = error.response.data
            const customError = new Error(backendError.message || 'Failed to update vendor')
            ;(customError as any).status = backendError.status || error.response.status
            ;(customError as any).code = backendError.error
            ;(customError as any).fields = backendError.fields
            throw customError
        }
        throw error
    }
}

/**
 * Delete owner by ID
 * Uses DELETE /api/owners/{id} which calls Laravel's DELETE /owners/{id} endpoint
 * 
 * @param id - Owner ID (integer) or UUID string
 */
export async function deleteOwner(id: string): Promise<void> {
    try {
        await axios.delete(`/api/owners/${id}`)
        // Backend returns: { message: "Owner deleted successfully." }
    } catch (error: any) {
        // Handle backend error format: { error: "ERROR_CODE", message: "...", status: 400 }
        if (error?.response?.data?.error) {
            const backendError = error.response.data
            const customError = new Error(backendError.message || 'Failed to delete owner')
            ;(customError as any).status = backendError.status || error.response.status
            ;(customError as any).code = backendError.error
            throw customError
        }
        throw error
    }
}
