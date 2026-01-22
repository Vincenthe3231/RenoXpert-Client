# Audit Trail Implementation Guide for Frontend

## Overview

The backend uses **Spatie Activity Log** package to track all user actions. Activity logs are **immutable** - they are never overwritten, only appended to.

---

## API Endpoint

**Endpoint:** `GET /api/v1/activity-logs`

**Access:** Super Admin, Admin, and Staff (protected by `user.module` middleware)

**Response Format:**
```json
{
  "data": [
    {
      "id": 1,
      "logName": "user",
      "description": "User account deactivated: John Doe",
      "event": "deactivated",
      "subjectType": "App\\Models\\User",
      "subjectId": 5,
      "causerType": "App\\Models\\User",
      "causerId": 1,
      "causer": {
        "id": 1,
        "name": "Super Admin",
        "email": "admin@example.com"
      },
      "properties": {
        "old": { "status": "active" },
        "attributes": { "status": "deactivated" },
        "module": "user",
        "ip": "127.0.0.1"
      },
      "createdAt": "2026-01-21T16:35:40+00:00"
    }
  ],
  "links": { /* pagination links */ },
  "meta": { /* pagination meta */ },
  "message": "Activity logs retrieved successfully."
}
```

---

## Supported Features

### 1. Pagination
- **Default:** 15 items per page
- **Configurable** via `per_page` query parameter
- **Example:** `GET /api/v1/activity-logs?per_page=20&page=2`

### 2. Filtering
Supported filters:
- `filter[log_name]` - Filter by log category (e.g., "user", "onboarding")
- `filter[event]` - Filter by event type (e.g., "deactivated", "activated", "role_changed", "profile_updated")
- `filter[causer_id]` - Filter by user who performed the action
- `filter[subject_id]` - Filter by target entity ID
- `filter[subject_type]` - Filter by target entity type (e.g., "App\\Models\\User")

**Example:**
```
GET /api/v1/activity-logs?filter[log_name]=user&filter[event]=deactivated
```

### 3. Sorting
- **Default:** `-created_at` (newest first)
- **Supported:** `created_at`, `id`
- **Example:** `?sort=created_at` (oldest first)

---

## Best Practices for Frontend Implementation

### 1. Prevent Overwriting Issues

**Problem:** Using `invalidateQueries` can cause logs to temporarily disappear during refetch, creating a poor UX.

**Solution:** Use `refetchQueries` instead of `invalidateQueries` for activity logs:

```typescript
// ❌ BAD - Causes temporary empty state
queryClient.invalidateQueries({ queryKey: ['activity-logs'] })

// ✅ GOOD - Preserves existing data during refetch
queryClient.refetchQueries({ queryKey: ['activity-logs'] })
```

**Why:** `refetchQueries` keeps the current data visible while fetching new logs in the background, preventing flickering or empty states.

### 2. Efficient Data Fetching

**Use pagination:**
```typescript
const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['activity-logs'],
  queryFn: async ({ pageParam = 1 }) => {
    const response = await axios.get('/api/v1/activity-logs', {
      params: {
        page: pageParam,
        per_page: 20,
        sort: '-created_at'
      }
    })
    return response.data
  },
  getNextPageParam: (lastPage) => {
    return lastPage.meta.current_page < lastPage.meta.last_page
      ? lastPage.meta.current_page + 1
      : undefined
  }
})
```

**Use filters to reduce data:**
```typescript
// Only fetch user-related activities
const { data } = useQuery({
  queryKey: ['activity-logs', 'user'],
  queryFn: () => axios.get('/api/v1/activity-logs', {
    params: {
      'filter[log_name]': 'user',
      'filter[subject_id]': userId
    }
  })
})
```

### 3. Display Optimization

**Group related activities using `batch_uuid` (if available):**
```typescript
// Group logs by batch_uuid to show related actions together
const groupedLogs = logs.reduce((acc, log) => {
  const key = log.properties?.batch_uuid || log.id
  if (!acc[key]) acc[key] = []
  acc[key].push(log)
  return acc
}, {})
```

**Virtual scrolling for large lists:**
- Use libraries like `react-window` or `react-virtual` for efficient rendering
- Only render visible items to prevent performance issues

**Lazy loading:**
- Load initial page (15-20 items)
- Load more on scroll or "Load More" button
- Use infinite scroll pattern

### 4. Real-time Updates (Optional)

**Polling strategy:**
```typescript
const { data } = useQuery({
  queryKey: ['activity-logs'],
  queryFn: fetchActivityLogs,
  refetchInterval: 30000, // Poll every 30 seconds
  refetchIntervalInBackground: true
})
```

**Manual refresh:**
```typescript
// Provide a refresh button for users
const { refetch } = useQuery({ queryKey: ['activity-logs'] })

// On button click
<Button onClick={() => refetch()}>Refresh Logs</Button>
```

### 5. Error Handling

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['activity-logs'],
  queryFn: fetchActivityLogs,
  retry: 2,
  retryDelay: 1000,
  onError: (error) => {
    // Log error but don't crash the UI
    console.error('Failed to fetch activity logs:', error)
  }
})
```

---

## Common Event Types

| Event | Description | Log Name |
|-------|-------------|----------|
| `deactivated` | User account deactivated | `user` |
| `activated` | User account activated | `user` |
| `role_changed` | User role changed | `user` |
| `profile_updated` | User profile updated | `user` |
| `approved` | Onboarding approved | `onboarding` |
| `rejected` | Onboarding rejected | `onboarding` |

---

## Properties Structure

Each log's `properties` object contains:
```typescript
{
  old: { /* previous values */ },      // What changed FROM
  attributes: { /* new values */ },    // What changed TO
  module: "user" | "onboarding",       // Which module
  ip: "127.0.0.1"                      // IP address of action
}
```

**Example Usage:**
```typescript
// Display change details
const oldStatus = log.properties?.old?.status
const newStatus = log.properties?.attributes?.status
// "Status changed from 'active' to 'deactivated'"
```

---

## Summary

1. ✅ **Use `refetchQueries` instead of `invalidateQueries`** to prevent overwriting
2. ✅ **Implement pagination** (default 15 per page, configurable)
3. ✅ **Use filters** to reduce data load
4. ✅ **Use virtual scrolling or lazy loading** for large lists
5. ✅ **Group related activities** by `batch_uuid` if available
6. ✅ **Handle errors gracefully** without crashing the UI
7. ✅ **Consider polling or manual refresh** for real-time updates

**Key Takeaway:** Activity logs are immutable and append-only. Use `refetchQueries` to update the list without causing temporary empty states or flickering.

