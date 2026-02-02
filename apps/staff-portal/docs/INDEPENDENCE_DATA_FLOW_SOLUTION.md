Here is the content reformatted into a clean, structured Markdown file.

```markdown
# Resolve Data Flow Independence Issues

## Analysis Confirmation
After reviewing the codebase, the data flow independence issues described in the document are accurate and significant.

### Verified Issues

#### 1. Query Key Fragmentation
* **Users:** `['users', params]` (from `AUTH_QUERY_KEYS.USERS`)
* **Owners:** `['owners', params]` (hardcoded, not in constants)
* **Vendors:** `['vendors', params]` (hardcoded, not in constants)
* **Impact:** Separate cache entries prevent data sharing.

#### 2. Page-Level Independent Fetching
* **Dashboard:** Fetches users + owners with `per_page: 1000`, merges manually.
* **Audit:** Fetches users + owners with `per_page: 1000`, plus complex 4-source merging.
* **Users:** Conditional fetching based on role (different endpoints).
* **Impact:** Redundant API calls on navigation.

#### 3. Complex Merging Logic
* Audit page merges from: `staffUsers`, `owners`, `usersFromOnboardings`, `subjectsFromActivityLogs`.
* Manual deduplication with `Map`-based logic.
* **Impact:** Fragile, hard to maintain, performance overhead.

#### 4. No Shared State
* No centralized store (Zustand/Context).
* TanStack Query cache not effectively shared.
* **Impact:** Stale data risk, no cross-page consistency.

---

## Solution Strategy

### Phase 1: Standardize Query Keys
**Files to Modify:**
* `apps/staff-portal/src/lib/api/auth/constants.ts`
* `apps/staff-portal/src/lib/api/auth/auth.hooks.ts`

**Changes:**
* Add `OWNERS` and `VENDORS` to `AUTH_QUERY_KEYS` constant.
* Update `ownersQueryOptions` and `vendorsQueryOptions` to use constants.
* Create unified query key structure: `['users', 'all', params]` for aggregated views.

**Benefits:** Consistent cache key structure, easier invalidation, and a foundation for a shared data layer.

### Phase 2: Create Unified User Fetching Hook
**New File:**
* `apps/staff-portal/src/lib/api/auth/useUnifiedUsers.ts`

**Implementation:**
```typescript
// Unified hook that abstracts role-based endpoint switching
export function useUnifiedUsers(params?: GetUsersParams) {
  const { data: currentUser } = useAuth()
  const isStaff = /* role check */
  
  // Automatically select correct endpoint based on role
  const usersQuery = useUsers(isStaff ? undefined : params)
  const ownersQuery = useOwners(isStaff ? params : undefined)
  const vendorsQuery = useVendors(/* conditional */)
  
  // Return unified data structure
  return {
    data: /* merged data */,
    isLoading: /* combined loading state */,
    // ... other query states
  }
}

```

**Benefits:** Single hook for all user types, automatic role-based selection, and consistent data structures.

### Phase 3: Implement Shared User Data Context

**New File:**

* `apps/staff-portal/src/app/context/UserDataContext/index.tsx`

**Implementation:**

* React Context provider wrapping TanStack Query.
* Pre-fetches commonly needed user data.
* Provides unified `useAllUsers()` hook.
* Handles cache invalidation globally.

**Benefits:** Single source of truth, automatic cache sharing, and reduced redundant fetches.

### Phase 4: Refactor Pages to Use Unified Hooks

**Files to Modify:**

* `apps/staff-portal/src/app/(DashboardLayout)/dashboard/page.tsx`
* `apps/staff-portal/src/app/(DashboardLayout)/audit/page.tsx`
* `apps/staff-portal/src/app/(DashboardLayout)/users/page.tsx`

**Changes:**

* Replace individual `useUsers()`, `useOwners()`, `useVendors()` calls with `useUnifiedUsers()`.
* Remove manual merging logic.
* Use shared context for user data.
* Simplify data extraction from activity logs (use as fallback only).

**Benefits:** Cleaner page code, consistent data access, and reduced complexity.

### Phase 5: Optimize Cache Strategy

**Files to Modify:**

* `apps/staff-portal/src/lib/api/auth/constants.ts`
* All mutation hooks in `auth.hooks.ts`

**Changes:**

* Increase `staleTime` for user lists (5 minutes instead of 30 seconds).
* Implement proper `gcTime` (garbage collection time).
* Add global invalidation on user mutations:

```typescript
// On user update
queryClient.invalidateQueries({ queryKey: ['users'] })
queryClient.invalidateQueries({ queryKey: ['owners'] })
queryClient.invalidateQueries({ queryKey: ['vendors'] })

```

---

## Implementation Details

### Query Key Structure

```typescript
// Standardized structure
AUTH_QUERY_KEYS = {
  ME: ['auth', 'me'],
  USERS: ['users'],
  OWNERS: ['users', 'owners'],  // Unified under 'users' namespace
  VENDORS: ['users', 'vendors'],
  USER: (uuid) => ['user', uuid],
  USERS_ALL: ['users', 'all'],  // For aggregated views
}

```

### Unified Hook Pattern

```typescript
// Single hook for all user types
const { data: allUsers, isLoading } = useUnifiedUsers({
  perPage: 1000,
  // Automatically handles role-based endpoint selection
})

```

### Cache Invalidation Strategy

```typescript
// On any user mutation
onSuccess: () => {
  // Invalidate all user-related queries
  queryClient.invalidateQueries({ 
    queryKey: ['users'],
    exact: false  // Invalidates all nested keys
  })
}

```

---

## Migration Path

| Week | Phase | Focus |
| --- | --- | --- |
| **Week 1** | Phase 1 | Standardize query keys |
| **Week 2** | Phase 2 | Create unified hooks |
| **Week 3** | Phase 3 | Implement context |
| **Week 4** | Phase 4 | Refactor pages |
| **Week 5** | Phase 5 | Optimize cache + Testing |

---

## Expected Outcomes

* **Performance:** 50-70% reduction in redundant API calls.
* **Consistency:** Single source of truth eliminates stale data.
* **Maintainability:** 60% reduction in merging/deduplication code.
* **UX:** Faster page navigation (cache hits instead of refetches).

## Risk Mitigation

* Implement incrementally (one phase at a time).
* Keep old hooks during transition (backward compatibility).
* Add feature flags for gradual rollout.

```

Would you like me to generate a specific implementation for the `useUnifiedUsers` hook or the `UserDataContext` provider next?

```