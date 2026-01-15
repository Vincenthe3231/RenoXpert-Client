# Frontend → Next.js → Backend Data Flow

## Overview

This document explains the complete data flow architecture in the Staff Portal application, detailing how requests flow from the frontend through Next.js API routes to the Laravel backend, and how responses are transformed and returned.

## Architecture Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW                          │
└─────────────────────────────────────────────────────────────────┘

FRONTEND (React Component)
    │
    │ { staffType: "admin" }  ← camelCase
    ▼
/src/lib/api/onboarding/onboarding.ts
    │ axios.post('/api/onboarding/123/approval', { staffType })
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  STAGE 1: REQUEST                                             │
│  Frontend makes HTTP request to Next.js API                  │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
/src/app/api/onboarding/[id]/approval/route.ts
    │
    │ ┌─────────────────────────────────────────────────────┐
    │ │ STAGE 2: INTERCEPT                                   │
    │ │ • Extract route params (id)                          │
    │ │ • Extract request body                               │
    │ │ • Extract cookies                                    │
    │ │ • Validate with Zod schema                           │
    │ └─────────────────────────────────────────────────────┘
    │
    │ { staffType: "admin" }  ← Still camelCase
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  STAGE 3: TRANSFORM (Request)                                  │
│  axios interceptor: keysToSnake()                             │
└───────────────────────────────────────────────────────────────┘
    │
    │ { staff_type: "admin" }  ← snake_case
    │
    ▼
laravelApi.post('/onboarding/123/approval', { staff_type: "admin" })
    │
    │ ┌─────────────────────────────────────────────────────┐
    │ │ STAGE 4: PROXY                                      │
    │ │ HTTP Request to Laravel Backend                     │
    │ │ POST /api/v1/onboarding/123/approval               │
    │ │ Body: { staff_type: "admin" }                      │
    │ │ Headers: { cookie: "session=..." }                │
    │ └─────────────────────────────────────────────────────┘
    │
    ▼
LARAVEL BACKEND
    │
    │ Processes request
    │ Returns: { user_id: 3, reviewed_by: 1, ... }  ← snake_case
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│  STAGE 5: TRANSFORM (Response)                                │
│  axios interceptor: keysToCamel()                             │
└───────────────────────────────────────────────────────────────┘
    │
    │ { userId: 3, reviewedBy: 1, ... }  ← camelCase
    │
    ▼
NextResponse.json(laravelRes.data)
    │
    │ ┌─────────────────────────────────────────────────────┐
    │ │ STAGE 6: RESPONSE                                   │
    │ │ • Return transformed data                           │
    │ │ • Forward cookies                                   │
    │ │ • Set status codes                                 │
    │ └─────────────────────────────────────────────────────┘
    │
    ▼
FRONTEND (React Component)
    │
    │ Receives: { userId: 3, reviewedBy: 1, ... }  ← camelCase
    │ Zod validation ensures type safety
    │
    ▼
Component updates with typed data
```

## Detailed Flow Breakdown

### Stage 1: Request (Frontend)

**Location**: `src/lib/api/**/*.ts`

**What happens**:
- React component calls API function
- Function uses `axios` to make HTTP request
- Data is in **camelCase** format
- Uses relative URLs (no backend URL exposed)

**Example**:
```typescript
// Frontend Component
onboardingApproval(123, "admin")

// src/lib/api/onboarding/onboarding.ts
export async function onboardingApproval(onboardingId: number, staffType: string) {
    const { data } = await axios.post(
        `/api/onboarding/${onboardingId}/approval`, 
        { staffType }  // ← camelCase
    );
    return onboardingSchema.parse(data);
}
```

**Data Format**: `{ staffType: "admin" }` (camelCase)

---

### Stage 2: Intercept (Next.js API Route)

**Location**: `src/app/api/**/route.ts`

**What happens**:
- Next.js route handler receives the request
- Extracts route parameters (for dynamic routes)
- Extracts query parameters (for GET requests)
- Extracts request body (for POST/PUT requests)
- Extracts cookies for authentication
- Validates data with Zod schemas

**Example**:
```typescript
// src/app/api/onboarding/[id]/approval/route.ts
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // INTERCEPT: Extract route parameter
    const { id } = await params  // id = "123"
    
    // INTERCEPT: Extract request body
    const body = await req.json()  // { staffType: "admin" }
    
    // INTERCEPT: Validate with Zod
    const validatedData = approveOnboardingSchema.parse(body)
    
    // INTERCEPT: Extract cookies
    const cookieStore = await cookies()
    const cookie = cookieStore.toString()
}
```

**Intercepted Data**:
- Route params: `{ id: "123" }`
- Body: `{ staffType: "admin" }` (camelCase)
- Cookies: Authentication cookies
- Validated: Zod schema ensures type safety

---

### Stage 3: Transform (Request: camelCase → snake_case)

**Location**: `src/lib/api/axios.ts` - `transformRequest` interceptor

**What happens**:
- Axios interceptor automatically transforms request data
- Converts all object keys from camelCase to snake_case
- Recursively processes nested objects and arrays
- Happens **before** request is sent to Laravel

**Transformation Function**:
```typescript
// src/lib/api/axios.ts
const transformRequest = (config: InternalAxiosRequestConfig) => {
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
        config.data = keysToSnake(config.data)  // ← TRANSFORM
    }
    return config
}
```

**Transformation Example**:
```javascript
// Input (camelCase)
{
  staffType: "admin",
  userId: 123,
  reviewData: {
    comment: "Approved",
    timestamp: "2025-01-04"
  }
}

// Output (snake_case)
{
  staff_type: "admin",
  user_id: 123,
  review_data: {
    comment: "Approved",
    timestamp: "2025-01-04"
  }
}
```

**Why**: Laravel backend expects snake_case format (PHP convention)

---

### Stage 4: Proxy (Next.js → Laravel Backend)

**Location**: `src/app/api/**/route.ts` - Uses `laravelApi` from `axios.ts`

**What happens**:
- Next.js makes HTTP request to Laravel backend
- Uses `LARAVEL_API_URL` environment variable (server-side only)
- Forwards authentication cookies
- Sends transformed snake_case data
- Backend URL is **never exposed** to frontend

**Example**:
```typescript
// src/app/api/onboarding/[id]/approval/route.ts
const laravelRes = await laravelApi.post(
    `/onboarding/${id}/approval`,  // → /api/v1/onboarding/123/approval
    validatedData,  // { staffType: "admin" } → { staff_type: "admin" }
    {
        headers: { cookie },  // Forward authentication
    }
)
```

**HTTP Request to Laravel**:
```
POST https://laravel-backend.com/api/v1/onboarding/123/approval
Headers: 
  - Cookie: session=abc123...
  - Accept: application/json
Body: 
  {
    "staff_type": "admin"  ← snake_case
  }
```

**Laravel Response**:
```json
{
  "id": 123,
  "user_id": 3,
  "reviewed_by": 1,
  "reviewed_at": "2025-01-04T10:30:00Z",
  "status": "approved",
  "assigned_user_type": "admin",
  "rejection_reason": null,
  "created_at": "2025-01-04T03:51:09Z"
}
```

---

### Stage 5: Transform (Response: snake_case → camelCase)

**Location**: `src/lib/api/axios.ts` - `transformResponse` interceptor

**What happens**:
- Axios interceptor automatically transforms response data
- Converts all object keys from snake_case to camelCase
- Recursively processes nested objects and arrays
- Happens **after** response is received from Laravel

**Transformation Function**:
```typescript
// src/lib/api/axios.ts
const transformResponse = (response: AxiosResponse): AxiosResponse => {
    if (response.data && typeof response.data === 'object') {
        response.data = keysToCamel(response.data)  // ← TRANSFORM
    }
    return response
}
```

**Transformation Example**:
```javascript
// Input from Laravel (snake_case)
{
  "user_id": 3,
  "reviewed_by": 1,
  "reviewed_at": "2025-01-04T10:30:00Z",
  "assigned_user_type": "admin",
  "user": {
    "email_verified_at": "2025-01-01T00:00:00Z"
  }
}

// Output (camelCase)
{
  "userId": 3,
  "reviewedBy": 1,
  "reviewedAt": "2025-01-04T10:30:00Z",
  "assignedUserType": "admin",
  "user": {
    "emailVerifiedAt": "2025-01-01T00:00:00Z"
  }
}
```

**Why**: Frontend uses camelCase format (JavaScript/TypeScript convention)

---

### Stage 6: Response (Next.js → Frontend)

**Location**: `src/app/api/**/route.ts` - Returns `NextResponse`

**What happens**:
- Next.js API route creates response with transformed data
- Forwards cookies from Laravel response
- Sets appropriate HTTP status codes
- Returns JSON response to frontend

**Example**:
```typescript
// src/app/api/onboarding/[id]/approval/route.ts
const res = NextResponse.json(laravelRes.data)  // Already camelCase

// Forward cookies from Laravel
const setCookies = laravelRes.headers['set-cookie']
if (setCookies) {
    for (const cookie of setCookies) {
        res.headers.append('Set-Cookie', cookie)
    }
}

return res
```

**Frontend Receives**:
```typescript
// src/lib/api/onboarding/onboarding.ts
const { data } = await axios.post(...)  // camelCase data
return onboardingSchema.parse(data)  // Zod validation
```

**Final Data to Frontend**:
```json
{
  "id": 123,
  "userId": 3,
  "reviewedBy": 1,
  "reviewedAt": "2025-01-04T10:30:00Z",
  "status": "approved",
  "assignedUserType": "admin",
  "rejectionReason": null,
  "createdAt": "2025-01-04T03:51:09Z"
}
```

---

## Complete Example: Onboarding Approval Flow

### Step-by-Step with Actual Data

#### 1. User Action
```typescript
// React Component
<button onClick={() => handleApprove(123, "admin")}>
  Approve
</button>
```

#### 2. Frontend API Call
```typescript
// src/lib/api/onboarding/onboarding.ts
export async function onboardingApproval(onboardingId: number, staffType: string) {
    const { data } = await axios.post(
        `/api/onboarding/${onboardingId}/approval`, 
        { staffType }  // { staffType: "admin" }
    );
    return onboardingSchema.parse(data);
}
```

**HTTP Request**:
```
POST http://localhost:3002/api/onboarding/123/approval
Content-Type: application/json
Body: { "staffType": "admin" }
```

#### 3. Next.js Intercepts
```typescript
// src/app/api/onboarding/[id]/approval/route.ts
export async function POST(req: Request, { params }) {
    const { id } = await params  // "123"
    const body = await req.json()  // { staffType: "admin" }
    const validatedData = approveOnboardingSchema.parse(body)  // ✓ Valid
    const cookieStore = await cookies()
}
```

#### 4. Transform Request
```typescript
// Automatic transformation via axios interceptor
// { staffType: "admin" } → { staff_type: "admin" }
```

#### 5. Proxy to Laravel
```typescript
const laravelRes = await laravelApi.post(
    `/onboarding/123/approval`,
    { staff_type: "admin" },  // snake_case
    { headers: { cookie: cookieStore.toString() } }
)
```

**HTTP Request to Laravel**:
```
POST https://laravel-backend.com/api/v1/onboarding/123/approval
Cookie: session=abc123...
Body: { "staff_type": "admin" }
```

#### 6. Laravel Processes
- Validates request
- Updates database
- Returns response

**Laravel Response**:
```json
{
  "id": 123,
  "user_id": 3,
  "reviewed_by": 1,
  "reviewed_at": "2025-01-04T10:30:00Z",
  "status": "approved",
  "assigned_user_type": "admin"
}
```

#### 7. Transform Response
```typescript
// Automatic transformation via axios interceptor
// { user_id: 3, reviewed_by: 1, ... } 
// → { userId: 3, reviewedBy: 1, ... }
```

#### 8. Next.js Returns
```typescript
const res = NextResponse.json(laravelRes.data)  // camelCase
// Forward cookies
return res
```

#### 9. Frontend Receives
```typescript
// Zod validation
const result = onboardingSchema.parse(data)
// Type-safe data: { id: 123, userId: 3, reviewedBy: 1, ... }
```

---

## Transformation Functions

### keysToSnake() - Request Transformation

**Location**: `src/lib/transform.ts`

**Purpose**: Convert camelCase keys to snake_case

**Example**:
```typescript
keysToSnake({
  staffType: "admin",
  userId: 123,
  reviewData: { comment: "OK" }
})

// Returns:
{
  staff_type: "admin",
  user_id: 123,
  review_data: { comment: "OK" }
}
```

### keysToCamel() - Response Transformation

**Location**: `src/lib/transform.ts`

**Purpose**: Convert snake_case keys to camelCase

**Example**:
```typescript
keysToCamel({
  user_id: 3,
  reviewed_by: 1,
  review_data: { comment: "OK" }
})

// Returns:
{
  userId: 3,
  reviewedBy: 1,
  reviewData: { comment: "OK" }
}
```

---

## Key Architectural Benefits

### 1. **Format Independence**
- Frontend always uses camelCase (JavaScript convention)
- Backend always uses snake_case (PHP/Laravel convention)
- No need to change either side when format changes

### 2. **Type Safety**
- Zod schemas validate data at boundaries
- TypeScript types inferred from schemas
- Runtime validation catches mismatches

### 3. **Security**
- Backend URL hidden from frontend
- Only server-side code knows `LARAVEL_API_URL`
- Cookies forwarded securely

### 4. **Separation of Concerns**
- Frontend doesn't know about backend format
- Next.js handles all transformations
- Backend doesn't need to change for frontend

### 5. **Error Handling**
- Centralized error handling in Next.js routes
- Consistent error format to frontend
- Backend errors transformed appropriately

---

## Request Flow Summary

| Stage | Location | Input Format | Output Format | Purpose |
|-------|----------|--------------|---------------|---------|
| **Request** | `src/lib/api/**/*.ts` | camelCase | camelCase | Frontend initiates request |
| **Intercept** | `src/app/api/**/route.ts` | camelCase | camelCase | Extract & validate data |
| **Transform (Req)** | `src/lib/api/axios.ts` | camelCase | snake_case | Convert for Laravel |
| **Proxy** | `src/app/api/**/route.ts` | snake_case | snake_case | Forward to Laravel |
| **Transform (Res)** | `src/lib/api/axios.ts` | snake_case | camelCase | Convert for frontend |
| **Response** | `src/app/api/**/route.ts` | camelCase | camelCase | Return to frontend |

---

## Response Flow Summary

| Stage | Location | Input Format | Output Format | Purpose |
|-------|----------|--------------|---------------|---------|
| **Laravel Response** | Laravel Backend | snake_case | snake_case | Backend processes & returns |
| **Transform** | `src/lib/api/axios.ts` | snake_case | camelCase | Convert for frontend |
| **Next.js Response** | `src/app/api/**/route.ts` | camelCase | camelCase | Return with cookies |
| **Frontend Validation** | `src/lib/api/**/*.ts` | camelCase | camelCase | Zod schema validation |
| **Component** | React Component | camelCase | camelCase | Use typed data |

---

## Cookie Flow

Cookies flow through all stages to maintain authentication:

```
Frontend Request
    │ (includes cookies)
    ▼
Next.js API Route
    │ cookies() extracts cookies
    │
    ▼
Forward to Laravel
    │ headers: { cookie: "session=..." }
    │
    ▼
Laravel Response
    │ Set-Cookie headers
    │
    ▼
Next.js API Route
    │ Forward Set-Cookie headers
    │
    ▼
Frontend
    │ Cookies set in browser
```

---

## Error Flow

Errors are handled at each stage:

```
Laravel Error
    │ { status: 400, message: "Validation failed" }
    │
    ▼
Next.js API Route
    │ catch (error) {
    │   const status = error?.response?.status || 500
    │   const message = error?.response?.data?.message
    │   return NextResponse.json({ error: message }, { status })
    │ }
    │
    ▼
Frontend API Function
    │ axios throws error
    │
    ▼
React Component
    │ try/catch or React Query error handling
```

---

## Query Parameters Flow (GET Requests)

For GET requests, query parameters are also transformed:

```typescript
// Frontend
getOnboardings({ page: 1, perPage: 10 })

// Next.js API Route
const { searchParams } = new URL(request.url)
const page = searchParams.get('page')  // "1"
const perPage = searchParams.get('perPage')  // "10"

// Transform to backend format
params.page = page
params.per_page = perPage  // snake_case

// Laravel receives
GET /api/v1/onboarding?page=1&per_page=10
```

---

## Pagination Links Transformation

Pagination links from Laravel need special handling:

```typescript
// Laravel returns
{
  "links": {
    "first": "http://laravel-backend.com/api/v1/onboarding?page=1",
    "next": "http://laravel-backend.com/api/v1/onboarding?page=2"
  }
}

// Should be transformed to
{
  "links": {
    "first": "http://localhost:3002/api/onboarding?page=1",
    "next": "http://localhost:3002/api/onboarding?page=2"
  }
}
```

**Note**: This transformation should be implemented in the API route to hide backend URLs.

---

## Route Handler Pattern

### HTTP Method Functions

Next.js route handlers export named HTTP methods:

```typescript
// route.ts
export async function GET(request: NextRequest) { }
export async function POST(request: NextRequest) { }
export async function PUT(request: NextRequest) { }
export async function DELETE(request: NextRequest) { }
export async function PATCH(request: NextRequest) { }
```

### Request Parameter Types

**NextRequest** (when you need URL/query params):
```typescript
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)  // ✅ Access query params
    // ... intercept and transform
}
```

**Request** (simpler, when you only need body):
```typescript
export async function POST(req: Request) {
    const body = await req.json()  // ✅ Access request body
    // ... process
}
```

**No parameter** (when you don't need request data):
```typescript
export async function GET() {
    // Uses cookies() from next/headers instead
    const cookieStore = await cookies()
}
```

### Dynamic Routes with Parameters

For dynamic routes like `[id]`, you get a second parameter:

```typescript
// src/app/api/onboarding/[id]/approval/route.ts
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params  // ✅ Extract route parameter
    const body = await req.json()
    // ... process
}
```

---

## Best Practices

1. **Always validate** with Zod schemas before sending to backend
2. **Always forward cookies** for authenticated requests
3. **Transform pagination links** to hide backend URLs
4. **Handle errors gracefully** with appropriate status codes
5. **Use NextRequest** when you need query params or URL parsing
6. **Use Request** when you only need the body
7. **Extract cookies** using `cookies()` from `next/headers`
8. **Use axios interceptors** for automatic data transformation
9. **Keep backend URLs server-side only** (never expose to frontend)
10. **Validate responses** with Zod schemas in frontend API functions

---

## File Structure

```
src/
├── app/
│   └── api/                    # Next.js API Routes (Proxy Layer)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── me/route.ts
│       │   └── users/route.ts
│       └── onboarding/
│           ├── route.ts
│           └── [id]/
│               ├── approval/route.ts
│               └── rejection/route.ts
│
└── lib/
    ├── api/                    # Frontend API Functions
    │   ├── axios.ts            # Axios instance with interceptors
    │   ├── auth/
    │   │   ├── auth.ts         # Frontend auth functions
    │   │   └── auth.schemas.ts # Zod schemas
    │   └── onboarding/
    │       ├── onboarding.ts  # Frontend onboarding functions
    │       └── onboarding.schemas.ts # Zod schemas
    └── transform.ts            # keysToCamel / keysToSnake functions
```

---

**Last Updated**: 2025-01-04  
**Version**: 1.2.0

