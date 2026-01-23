# Audit Log Limitation: User Management Actions Not Tracked

## Overview

This document informs backend developers about a current limitation in the Audit Log system: **user management actions (such as deactivation by Super Admins) are not currently tracked in the audit log**.

## Current Behavior

### What IS Tracked

The Audit Log page (`/audit`) currently **only displays onboarding decisions**:

- ✅ **Approved** onboarding requests
- ✅ **Rejected** onboarding requests

**Frontend Implementation:**
```typescript
// src/app/(DashboardLayout)/audit/page.tsx
const decisions = onboardings
  .filter(o => o.status === 'approved' || o.status === 'rejected')
  .sort((a, b) => {
    const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0
    const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0
    return dateB - dateA
  })
```

**Data Source:**
- Frontend fetches data from: `GET /api/onboarding` (which proxies to `GET /api/v1/onboarding`)
- Only onboarding records with `status: 'approved'` or `status: 'rejected'` are displayed

### What IS NOT Tracked

The following user management actions are **NOT** currently logged in the audit trail:

- ❌ **User Deactivation** (`POST /api/v1/users/{id}/deactivate`)
- ❌ **User Activation** (`POST /api/v1/users/{id}/activate`)
- ❌ **User Role Changes**
- ❌ **User Permission Updates**
- ❌ **Other user management operations**

## Evidence

### User Deactivation Works, But Not Logged

1. **Deactivation is functional:**
   - Super Admins can successfully deactivate users
   - Deactivated users appear in the user list with status "deactivated"
   - Users can be filtered by "deactivated" status

2. **Deactivation is NOT logged:**
   - No audit log entry is created when a user is deactivated
   - The audit log page only shows onboarding decisions
   - There is no backend endpoint to fetch user management audit logs

### Frontend Audit Log Implementation

**File:** `src/app/(DashboardLayout)/audit/page.tsx`

```typescript
export default function AuditPage() {
  // Get all onboardings (approved and rejected)
  const { data: onboardingsData, isLoading } = useOnboardings()
  const onboardings = onboardingsData?.data || []

  // Filter to only show decisions (approved or rejected)
  const decisions = onboardings
    .filter(o => o.status === 'approved' || o.status === 'rejected')
    // ... sorting logic
}
```

**Key Points:**
- The audit page only queries the `/api/onboarding` endpoint
- It filters for `status === 'approved' || status === 'rejected'`
- There is no code to fetch or display user management audit logs

## Required Backend Implementation

To support tracking user management actions in the audit log, the backend needs to:

### 1. Create Audit Log Entries

When user management actions occur, create audit log entries in the database:

**Example: User Deactivation**
```php
// When UserController::deactivate() is called
// After successfully deactivating the user:

AuditLog::create([
    'action' => 'user_deactivated',
    'user_id' => $user->id,
    'performed_by' => auth()->id(),
    'metadata' => [
        'user_name' => $user->name,
        'user_email' => $user->email,
        'previous_status' => 'active',
        'new_status' => 'deactivated',
    ],
    'created_at' => now(),
]);
```

**Other actions to track:**
- `user_activated`
- `user_role_changed`
- `user_permissions_updated`
- `user_created` (if applicable)
- `user_updated` (if applicable)

### 2. Create API Endpoint to Fetch Audit Logs

Create a new endpoint to retrieve audit log entries:

**Endpoint:** `GET /api/v1/audit-logs`

**Query Parameters:**
- `action` (optional): Filter by action type (`user_deactivated`, `user_activated`, etc.)
- `user_id` (optional): Filter by affected user ID
- `performed_by` (optional): Filter by who performed the action
- `date_from` (optional): Filter by date range
- `date_to` (optional): Filter by date range
- `page` (optional): Pagination
- `per_page` (optional): Items per page

**Response Format:**
```json
{
  "data": [
    {
      "id": 1,
      "action": "user_deactivated",
      "user": {
        "id": 3,
        "uuid": "5f299eb8-fcb7-43e4-888b-6a6a28b4e680",
        "name": "Law Wen Sen",
        "email": "wen.sen@belive.my"
      },
      "performedBy": {
        "id": 1,
        "name": "Super Admin",
        "email": "super.admin@example.com"
      },
      "metadata": {
        "previous_status": "active",
        "new_status": "deactivated"
      },
      "createdAt": "2026-01-15T01:30:00.000000Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Middleware Requirements:**
- Protected by `auth:sanctum`
- Only accessible to Super Admins (or appropriate role)
- Use `account.status` middleware if needed

### 3. Resource Class for Audit Logs

Create a Laravel Resource class for consistent API responses:

```php
// app/Http/Resources/AuditLogResource.php

class AuditLogResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'user' => new UserResource($this->user),
            'performedBy' => new UserResource($this->performedBy),
            'metadata' => $this->metadata,
            'createdAt' => $this->created_at,
        ];
    }
}
```

## Frontend Changes Required (After Backend Implementation)

Once the backend provides the audit log endpoint, the frontend will need to:

1. **Create API service function:**
   ```typescript
   // src/lib/api/audit/audit.ts
   export async function getAuditLogs(params?: GetAuditLogsParams): Promise<AuditLogListResponse>
   ```

2. **Update audit page:**
   - Fetch both onboarding decisions AND user management audit logs
   - Merge and sort by date
   - Display in a unified audit table

3. **Add filtering:**
   - Filter by action type (onboarding vs. user management)
   - Filter by user
   - Filter by date range

## Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Onboarding decisions (approved/rejected) | ✅ Tracked | Displayed in audit log |
| User deactivation | ❌ Not tracked | No audit log entry created |
| User activation | ❌ Not tracked | No audit log entry created |
| Other user management actions | ❌ Not tracked | No audit log entry created |

## Next Steps

1. **Backend:** Implement audit log creation for user management actions
2. **Backend:** Create `GET /api/v1/audit-logs` endpoint
3. **Frontend:** Update audit page to fetch and display user management audit logs
4. **Testing:** Verify audit logs are created and displayed correctly

## Related Files

- **Frontend Audit Page:** `src/app/(DashboardLayout)/audit/page.tsx`
- **Frontend Audit Table:** `src/app/(DashboardLayout)/audit/AuditTable.tsx`
- **User Deactivation Endpoint:** `POST /api/v1/users/{id}/deactivate`
- **Onboarding Endpoint:** `GET /api/v1/onboarding`

## Questions or Issues?

If you have questions about implementing audit log tracking for user management actions, please contact the frontend team or refer to the existing onboarding audit log implementation as a reference.

