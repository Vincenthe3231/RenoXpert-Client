Analysis: Frontend Architecture Data Flow Independence Issue
After analyzing the codebase, it is confirmed that the frontend architecture exhibits significant data fetching independence issues. Below is a detailed breakdown of the current state, identified problems, and recommended paths forward.
1. Current Data Fetching Architecture
The frontend currently employs multiple, disconnected data fetching patterns across the application:
- API Routes: /apps/staff-portal/src/app/api/users/[id]/route.ts - Handles individual user updates.
- Auth Hooks: /apps/staff-portal/src/lib/api/auth/auth.hooks.ts - Contains standalone hooks such as useUsers(), useOwners(), and useVendors().
- Page-level Fetching: Each individual page independently orchestrates its own data requirements.
2. Key Issues Identified
A. Independent Fetching Across Pages
Data is fetched in silos depending on which route the user is visiting:
- Dashboard (/dashboard/page.tsx): Fetches users and owners separately (both at 1000 items per page) and combines them manually using useMemo.
- Audit Page (/audit/page.tsx): Fetches users and owners independently. It includes high-complexity merging logic with fallback extraction from activity logs.
- Users Page (/users/page.tsx): Conditional fetching based on user role (Staff vs. Admin/Super-Admin), hitting different endpoints (/api/auth/users vs. /api/owners vs. /api/vendors).
B. Lack of a Shared Data Layer
There is no "source of truth" for user data:
- No Centralized Store: Data fetched by one page is invisible to another.
- Redundant Calls: Navigating between pages triggers fresh API requests for the same entities.
- Inconsistent Configs: Different pages use varying query parameters and pagination settings for the same data types.
C. Complex Data Merging Logic
The Audit page specifically demonstrates the fragility of this approach, requiring manual deduplication from four distinct sources:
```
// Example of existing complex merging logic:
const staffUsers = usersData?.data || [];
const owners = ownersData?.data || [];
const usersFromOnboardings = useMemo(() => { /* ... */ }, [onboardings]);
const subjectsFromActivityLogs = useMemo(() => { /* ... */ }, [activityLogs]);

const users = useMemo(() => {
  const allUsers = [
    ...staffUsers, 
    ...owners, 
    ...usersFromOnboardings, 
    ...subjectsFromActivityLogs
  ];
  // ... deduplication logic
}, [staffUsers, owners, usersFromOnboardings, subjectsFromActivityLogs]);
```
3. Root Cause Analysis
The architecture currently follows a page-centric data fetching pattern:
1. Pages determine their own data requirements in isolation.
2. There is no shared state management (e.g., Zustand or high-level Context) for global entities.
3. While TanStack Query is present, cache keys are often page-specific rather than entity-specific.
4. Fragmented API design requires hitting different endpoints for different user roles.
4. Impact Assessment
- Performance: Unnecessary network overhead due to redundant API calls.
- Consistency: Risk of "stale" data on one page while another shows updated info.
- Maintenance: Logic for merging and deduplicating users is scattered and hard to debug.
- UX: Frequent loading spinners during navigation between pages that should already have the data.
5. Recommended Solutions
1. Centralized User Store: Standardize TanStack Query keys (e.g., ['users', 'all']) to allow data sharing across the cache.
2. Abstraction Layer: Create a service or unified hook that abstracts the complexity of switching between Staff, Owner, and Vendor endpoints.
3. Invalidation Strategy: Implement global query invalidation to ensure updates to a user on one page reflect everywhere.
4. Caching Optimization: Set appropriate staleTime and cacheTime to prevent immediate re-fetching during breadcrumb navigation.
5. State Management: Consider a lightweight state manager (Zustand) or React Context for user metadata that requires frequent, cross-component access.
Conclusion: The current architecture is functional but inefficient. Moving from page-centric fetching to an entity-centric shared data layer will significantly improve performance and maintainability.