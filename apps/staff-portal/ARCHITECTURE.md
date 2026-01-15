# Staff Portal Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RENOXPERT-CLIENT (Monorepo)                      │
│                    Turbo + pnpm Workspace + Next.js 16                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │  staff-portal│ │ client-app  │ │  website   │
            │   (Next.js)  │ │  (Next.js)  │ │  (Next.js) │
            └───────┬──────┘ └─────────────┘ └────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼───┐    ┌─────▼─────┐   ┌────▼────┐
│ Front │    │  Next.js   │   │ Laravel │
│  End  │───▶│ API Routes │──▶│ Backend │
│ (UI)  │    │  (Proxy)   │   │   API   │
└───┬───┘    └─────┬─────┘   └────┬────┘
    │              │               │
    │              │               │
    └──────────────┴───────────────┘
              Data Flow
```

## 1. Monorepo Structure

```
RenoXpert-Client/
├── apps/
│   ├── staff-portal/     ← Current app
│   ├── client-app/
│   ├── website/
│   └── renohub-connect-main/
├── packages/             ← Shared packages
├── turbo.json            ← Turborepo config
└── pnpm-workspace.yaml   ← Workspace config
```

### Build System
- **Turborepo**: Monorepo build orchestration
- **pnpm Workspace**: Package management
- **Turbopack**: Enabled for faster builds (`--turbo` flag)

## 2. Staff Portal App Structure

```
apps/staff-portal/
├── src/
│   ├── app/                    ← Next.js App Router
│   │   ├── (auth)/             ← Auth route group
│   │   │   └── login/
│   │   ├── (DashboardLayout)/  ← Dashboard route group
│   │   │   ├── layout.tsx      ← Stateful layout (Client Component)
│   │   │   ├── onboarding/
│   │   │   └── users/
│   │   ├── api/                ← Next.js API Routes (Proxy Layer)
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── me/route.ts
│   │   │   │   └── users/route.ts
│   │   │   └── onboarding/
│   │   │       └── route.ts
│   │   └── layout.tsx          ← Root layout (Server Component)
│   │
│   ├── lib/api/                ← Client-side API functions
│   │   ├── axios.ts            ← Axios config (Laravel API)
│   │   ├── auth/
│   │   │   ├── auth.ts         ← Frontend → Next.js API
│   │   │   ├── auth.schemas.ts ← Zod validation
│   │   │   └── auth.hooks.ts   ← React Query hooks
│   │   └── onboarding/
│   │       ├── onboarding.ts
│   │       ├── onboarding.schemas.ts
│   │       └── onboarding.hooks.ts
│   │
│   ├── components/             ← UI Components
│   │   └── ui/                 ← shadcn/ui components
│   │
│   └── providers/              ← Context Providers
│       └── AuthProvider.tsx
│
└── package.json
```

## 3. Three-Layer API Architecture

### Layer 1: Frontend (Client)
**Location**: `/src/lib/api/*.ts`

- Uses relative URLs (`/api/onboarding`)
- Zod schema validation for type safety
- React Query hooks for data fetching
- No knowledge of backend URL

**Example**:
```typescript
// src/lib/api/onboarding/onboarding.ts
export async function getOnboardings(params?: GetOnboardingParams) {
    const { data } = await axios.get('/api/onboarding', { params })
    const result = onboardingListSchema.safeParse(data)
    return result.data
}
```

### Layer 2: Next.js API Routes (Proxy)
**Location**: `/src/app/api/**/route.ts`

- Receives requests from frontend
- Forwards cookies for authentication
- Transforms data (snake_case ↔ camelCase)
- Hides backend URL from frontend
- Error handling & response transformation

**Example**:
```typescript
// src/app/api/onboarding/route.ts
export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const { data } = await laravelApi.get('/onboarding', {
        headers: { cookie: cookieStore.toString() },
    })
    return NextResponse.json(data)
}
```

### Layer 3: Laravel Backend API
**Location**: `RenoXpert-Backend` (separate repository)

- `/api/v1/onboarding`
- `/api/v1/auth/login`
- Sanctum authentication
- Returns snake_case data
- URL: `process.env.LARAVEL_API_URL`

## 4. Data Flow Example (Onboarding)

```
User Action
    │
    ▼
React Component (useOnboardings hook)
    │
    ▼
/src/lib/api/onboarding/onboarding.ts
    │ getOnboardings()
    │ • axios.get('/api/onboarding')
    │ • Zod validation
    │
    ▼
/src/app/api/onboarding/route.ts (Next.js API Route)
    │ GET handler
    │ • Extract cookies
    │ • Transform params
    │ • Forward to Laravel
    │
    ▼
laravelApi.get('/onboarding') → Laravel Backend
    │ • BASE_URL/api/v1/onboarding
    │ • With credentials
    │ • snake_case transformation
    │
    ▼
Laravel Response
    │ • Pagination data
    │ • snake_case format
    │
    ▼
Next.js API Route
    │ • Transform to camelCase
    │ • Return NextResponse.json(data)
    │
    ▼
Frontend API Function
    │ • Zod schema validation
    │ • Type-safe return
    │
    ▼
React Component
    │ • Typed data
    │ • React Query caching
```

## 5. Layout Hierarchy

### Root Layout (Server Component)
**File**: `src/app/layout.tsx`

- Stateless Server Component
- Exports metadata
- Provides global providers

```typescript
RootLayout (Server Component)
├── Providers (Client Component)
│   ├── QueryClientProvider
│   └── AuthProvider
├── ThemeProvider
├── CustomizerContextProvider
└── children
```

### Dashboard Layout (Client Component)
**File**: `src/app/(DashboardLayout)/layout.tsx`

- Stateful Client Component
- Uses `useContext` for state
- Maintains state across navigation
- Persistent layout (doesn't remount)

```typescript
(DashboardLayout)/layout.tsx (Client Component - Stateful)
├── SidebarProvider
├── Sidebar (uses CustomizerContext)
├── Header (uses CustomizerContext)
└── children (page content)
    ├── /onboarding/page.tsx
    └── /users/page.tsx
```

### Layout Types

| Type | File | State | Remounts |
|------|------|-------|----------|
| **Layout** | `layout.tsx` | Persistent | No |
| **Template** | `template.tsx` | Resets | Yes |

## 6. State Management

```
┌─────────────────────────────────────────┐
│         State Management Layers         │
├─────────────────────────────────────────┤
│                                         │
│  React Query (Server State)            │
│  • API data caching                    │
│  • useOnboardings()                    │
│  • useUsers()                          │
│                                         │
│  Context API (Client State)            │
│  • CustomizerContext                   │
│    - Layout preferences                │
│    - Theme settings                    │
│    - localStorage persistence          │
│                                         │
│  React State (Component State)         │
│  • useState() for local UI state       │
│                                         │
└─────────────────────────────────────────┘
```

### State Persistence

- **Layout State**: Persists across navigation (layouts don't remount)
- **Context State**: Persists via localStorage (`usePersistentState` hook)
- **Server State**: Cached by React Query with configurable stale time

## 7. Key Architectural Patterns

### 1. Proxy Pattern
- **Purpose**: Hide backend URL from frontend
- **Implementation**: Next.js API routes act as proxy
- **Benefit**: Backend URL only in server-side code

### 2. Type Safety
- **Tool**: Zod schemas for runtime validation
- **Location**: `/src/lib/api/**/*.schemas.ts`
- **Benefit**: Catch data mismatches at runtime

### 3. Data Transformation
- **Request**: camelCase → snake_case (automatic)
- **Response**: snake_case → camelCase (automatic)
- **Location**: `src/lib/api/axios.ts` interceptors

### 4. Cookie Forwarding
- **Purpose**: Maintain authentication across proxy
- **Implementation**: Server-side routes forward cookies
- **Benefit**: Seamless auth without exposing backend

### 5. Monorepo Architecture
- **Tool**: Turborepo for build orchestration
- **Package Manager**: pnpm workspaces
- **Benefit**: Shared code, independent deployments

### 6. Layout Persistence
- **Type**: Persistent layouts (default in Next.js)
- **Behavior**: State maintained across navigation
- **Use Case**: Sidebar state, theme preferences

### 7. React Query Integration
- **Purpose**: Server state management
- **Features**: Caching, refetching, optimistic updates
- **Location**: Custom hooks in `/src/lib/api/**/*.hooks.ts`

## 8. Environment Variables

```bash
# Required
LARAVEL_API_URL=https://backend.example.com  # Backend URL (server-side only)
```

## 9. Technology Stack

### Frontend
- **Framework**: Next.js 16.0.7 (App Router)
- **React**: 19.2.0
- **Bundler**: Turbopack (enabled)
- **Styling**: Tailwind CSS 4.1.6
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Query + Context API
- **Validation**: Zod 4.0.14
- **HTTP Client**: Axios 1.13.2

### Build Tools
- **Monorepo**: Turborepo 2.7.2
- **Package Manager**: pnpm 8.15.6
- **TypeScript**: 5

### Backend Integration
- **Backend**: Laravel (RenoXpert-Backend)
- **Auth**: Laravel Sanctum
- **API Version**: v1

## 10. Security Features

1. **Backend URL Hidden**: Only in server-side code
2. **Cookie Forwarding**: Secure authentication flow
3. **CSRF Protection**: Sanctum CSRF tokens
4. **Type Validation**: Zod schemas prevent invalid data
5. **Error Handling**: Graceful error responses

## 11. API Endpoints

### Frontend → Next.js (Relative URLs)
- `GET /api/onboarding`
- `POST /api/onboarding/[id]/approval`
- `GET /api/auth/me`
- `POST /api/auth/login`
- `GET /api/auth/users`

### Next.js → Laravel (Full URLs)
- `GET ${LARAVEL_API_URL}/api/v1/onboarding`
- `POST ${LARAVEL_API_URL}/api/v1/onboarding/{id}/approval`
- `GET ${LARAVEL_API_URL}/api/v1/me`
- `POST ${LARAVEL_API_URL}/api/v1/login`
- `GET ${LARAVEL_API_URL}/api/v1/users`

## 12. Development Workflow

```bash
# Start development server
pnpm run dev  # Runs with Turbopack on port 3002

# Build for production
pnpm run build  # Uses Turbopack

# Run from monorepo root
cd /home/vince/projects/RenoXpert-Client
pnpm run dev  # Runs all apps via Turbo
```

---

**Last Updated**: 2025-01-04  
**Version**: 1.2.0  
**Next.js**: 16.0.7  
**Turbopack**: Enabled
