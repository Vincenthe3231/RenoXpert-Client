# TanStack Query Overwriting Issue - Audit Logs Analysis

## Root Causes of Overwriting Issue

### 1. Using `invalidateQueries` (Most Common)

**Problem:**
```typescript
// ❌ This clears the cache FIRST, then refetches
queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
```

**What happens:**
1. Cache is cleared → UI shows empty/loading state
2. Refetch starts → new request sent
3. New data arrives → replaces empty state
4. **Result:** Appears as if logs were overwritten

**Solution:**
```typescript
// ✅ This preserves existing data while fetching new data
queryClient.refetchQueries({ queryKey: ['activity-logs'] })
```

---

### 2. Race Conditions with Multiple Mutations

**Problem:** Multiple quick mutations all invalidate the same query:
```typescript
// Mutation 1: Update profile
updateUser.mutate(...)
queryClient.invalidateQueries({ queryKey: ['activity-logs'] })

// Mutation 2: Change role (happens immediately after)
changeRole.mutate(...)
queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
```

**Solution:** Batch invalidations or use `refetchQueries`:
```typescript
// Wait for all mutations, then refetch once
await Promise.all([
  updateUser.mutateAsync(...),
  changeRole.mutateAsync(...)
])
queryClient.refetchQueries({ queryKey: ['activity-logs'] })
```

---

### 3. Pagination State Loss

**Problem:** Invalidating resets pagination:
```typescript
// User is on page 3
queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
// Now back to page 1, losing current position
```

**Solution:** Preserve pagination or use `refetchQueries`:
```typescript
// Option 1: Refetch current page
const currentPage = queryClient.getQueryData(['activity-logs'])?.meta?.current_page || 1
queryClient.refetchQueries({ 
  queryKey: ['activity-logs'],
  // Refetch will use current query params
})
```

---

### 4. Missing `keepPreviousData` or `placeholderData`

**Problem:** Query shows loading/empty during refetch:
```typescript
const { data } = useQuery({
  queryKey: ['activity-logs'],
  queryFn: fetchLogs,
  // Missing keepPreviousData
})
```

**Solution:**
```typescript
const { data } = useQuery({
  queryKey: ['activity-logs'],
  queryFn: fetchLogs,
  keepPreviousData: true, // ✅ Keep showing old data while fetching new
  // OR in v5:
  placeholderData: (previousData) => previousData,
})
```

---

### 5. Query Key Instability

**Problem:** Query keys change, creating new cache entries:
```typescript
// ❌ Bad - query key changes
const { data } = useQuery({
  queryKey: ['activity-logs', filters], // filters object changes reference
  queryFn: () => fetchLogs(filters)
})

// ✅ Good - stable query key
const { data } = useQuery({
  queryKey: ['activity-logs', JSON.stringify(filters)], // Stable
  queryFn: () => fetchLogs(filters)
})
```

---

### 6. Using `setQueryData` Incorrectly

**Problem:** Manually overwriting cache:
```typescript
// ❌ This overwrites instead of appending
queryClient.setQueryData(['activity-logs'], newData)
```

**Solution:** Use updater function:
```typescript
// ✅ Append new log to existing data
queryClient.setQueryData(['activity-logs'], (oldData) => {
  if (!oldData) return newData
  return {
    ...newData,
    data: [...newData.data, ...oldData.data] // Merge arrays
  }
})
```

---

## Recommended Solution

For audit logs (append-only, immutable):

```typescript
// ✅ BEST PRACTICE: Use refetchQueries with keepPreviousData
const { data, isLoading } = useQuery({
  queryKey: ['activity-logs', filters],
  queryFn: () => fetchActivityLogs(filters),
  keepPreviousData: true, // Keep showing old data during refetch
  staleTime: 30000, // Consider data fresh for 30 seconds
})

// After mutations
const handleMutationSuccess = async () => {
  // Wait a bit for backend to commit the log
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Refetch without clearing cache
  await queryClient.refetchQueries({ 
    queryKey: ['activity-logs'],
    type: 'active' // Only refetch active queries
  })
}
```

---

## Quick Diagnostic Checklist

1. ✅ Are you using `invalidateQueries`? → Switch to `refetchQueries`
2. ✅ Is `keepPreviousData: true` set? → Add it
3. ✅ Are query keys stable? → Use stable keys (JSON.stringify, primitives)
4. ✅ Are multiple mutations invalidating? → Batch and refetch once
5. ✅ Is pagination resetting? → Preserve page state or use `refetchQueries`

---

## Most Likely Fix

Replace all instances of:
```typescript
queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
```

With:
```typescript
queryClient.refetchQueries({ queryKey: ['activity-logs'] })
```

And add to your query:
```typescript
keepPreviousData: true
```

This keeps existing logs visible while new data loads, preventing the overwriting appearance.

