# Onboarding Module - Implementation Checklist

## ✅ Completed Features

- [x] Main onboarding page showing pending requests
- [x] Onboarding table displaying staff information  
- [x] Approve dialog with staff type selection (Admin/Staff)
- [x] Approve API endpoint (`/api/onboarding/[id]/approval`)
- [x] Approve hook (`useApproveOnboarding`)
- [x] Reject dialog UI component
- [x] Client-side rejection function (`onboardingRejection`)

---

## ❌ Missing/Incomplete Features

### 1. Rejection API Route
- [ ] Create `/api/onboarding/[id]/rejection/route.ts`
  - Handle POST requests to reject onboarding
  - Validate request body with `rejectOnboardingSchema`
  - Forward request to Laravel backend endpoint
  - Handle errors and validation failures
  - **Status:** `onboardingRejection` function exists but calls non-existent route

### 2. Rejection Hook
- [ ] Create `useRejectOnboarding` hook in `src/lib/api/onboarding/onboarding.hooks.ts`
  - Use `useMutation` from react-query
  - Call `onboardingRejection` function
  - Invalidate queries on success
  - **Status:** Hook is missing, only `useApproveOnboarding` exists

### 3. Rejection Handler Implementation
- [ ] Complete `handleRejectConfirm` in `src/app/(DashboardLayout)/onboarding/page.tsx` (lines 32-39)
  - Replace `console.log` with actual rejection mutation call
  - Close dialog on success
  - Reset selected onboarding state
  - **Status:** Currently only logs to console

### 4. ApproveDialog Loading State
- [ ] Pass `isLoading` prop to `ApproveDialog` component
  - Connect `approveOnboarding.isPending` to `isLoading` prop
  - **Status:** Prop exists but not connected

### 5. Rejected Staff Page
- [ ] Create rejected staff page (e.g., `/rejected` or `/onboarding/rejected`)
  - Display rejection reason clearly
  - Inform user they cannot access RenoXpert
  - Provide clear messaging about the rejection
  - **Requirement:** "On the staff member's next login attempt, they are shown a 'Rejected' page that displays the rejection reason."

### 6. Lark OAuth Callback - Rejection Status Check
- [ ] Add rejection status check in `src/app/auth/larksuite/callback/page.tsx`
  - After successful OAuth, check user's onboarding status
  - If status is "rejected", redirect to rejected page
  - If status is "approved", proceed to dashboard
  - If status is "pending", redirect to pending/waiting page
  - **Status:** Currently only checks if user exists, doesn't check onboarding status

### 7. Super Admin Authorization
- [ ] Add authorization check in onboarding page
  - Verify user is Super Admin before rendering
  - Show access denied message for non-super-admin users
  - **Location:** `src/app/(DashboardLayout)/onboarding/page.tsx`

- [ ] Hide/disable onboarding link in sidebar for non-super-admin users
  - Check user role in `Sidebaritems.ts` or `NavItems.tsx`
  - Conditionally show onboarding menu item
  - **Location:** `src/app/(DashboardLayout)/layout/sidebar/Sidebaritems.ts`

- [ ] Add API route protection (backend should also enforce)
  - Note: Backend Laravel API should validate Super Admin access
  - Frontend should also check for better UX

---

## 📋 Implementation Priority

1. **High Priority** (Core Functionality)
   - Rejection API route and hook (#1, #2)
   - Complete rejection handler (#3)
   - Rejected staff page (#5)
   - Rejection status check in OAuth callback (#6)

2. **Medium Priority** (User Experience)
   - ApproveDialog loading state (#4)

3. **High Priority** (Security/Authorization)
   - Super Admin authorization checks (#7)

---

## 📝 Notes

- All API routes should follow the same pattern as the approval route (`/api/onboarding/[id]/approval/route.ts`)
- Rejection schema already exists: `rejectOnboardingSchema` in `onboarding.schemas.ts`
- User type checking may be needed to ensure only staff members appear in onboarding list (owners/vendors should be excluded)
- The onboarding status flow should be: `pending` → `approved` or `rejected`
- When a rejected user tries to login, they should see the rejection page, not the dashboard

