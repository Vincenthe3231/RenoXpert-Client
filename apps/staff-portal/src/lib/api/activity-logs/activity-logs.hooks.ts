import { keepPreviousData, useQuery, useInfiniteQuery, queryOptions } from "@tanstack/react-query";
import { ACTIVITY_LOGS_QUERY_KEYS, ACTIVITY_LOGS_QUERY_CONFIG } from "./constants";
import { getActivityLogs } from "./activity-logs";
import { GetActivityLogsParams, ActivityLogListResponse } from "./activity-logs.schemas";

/**
 * Query options factory for activity logs list
 * 
 * AUDIT TRAIL INTEGRITY: Uses `keepPreviousData` to prevent empty states during refetch.
 * Activity logs are immutable and append-only. We preserve previous data to maintain
 * audit trail integrity and prevent flickering/empty states.
 * 
 * IMPORTANT: When mutations occur (user updates, role changes, etc.), use `refetchQueries`
 * instead of `invalidateQueries` to preserve previous data during refetch.
 * See: apps/staff-portal/docs/AUDIT_TRAIL_IMPLEMENTATION_GUIDE.md
 */
export function activityLogsQueryOptions(params?: GetActivityLogsParams) {
  return queryOptions({
    queryKey: [...ACTIVITY_LOGS_QUERY_KEYS.LIST, params],
    queryFn: () => getActivityLogs(params),
    placeholderData: keepPreviousData, // Preserves previous data during refetch to maintain integrity
    staleTime: ACTIVITY_LOGS_QUERY_CONFIG.STALE_TIME,
    refetchOnWindowFocus: false, // Prevent automatic refetch on window focus to avoid unnecessary reloads
  });
}

/**
 * React hook to fetch activity logs
 * 
 * @param params - Query parameters including filters, pagination, and sorting
 * @returns React Query result with activity logs data
 */
export function useActivityLogs(params?: GetActivityLogsParams) {
  return useQuery({
    ...activityLogsQueryOptions(params),
    // Don't retry on 401/403 errors (permission denied)
    retry: (failureCount, error: any) => {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
        return false // Don't retry permission errors
      }
      return failureCount < 3 // Retry other errors up to 3 times
    },
  });
}

/**
 * React hook to fetch activity logs with infinite pagination (Load More)
 * 
 * AUDIT TRAIL INTEGRITY: Uses infinite query pattern to progressively load logs
 * while maintaining immutability. Each page is cached separately, and pages
 * are accumulated without mutating existing data.
 * 
 * @param params - Query parameters including filters and sorting (page and perPage are handled internally)
 * @returns React Query infinite query result with paginated activity logs data
 */
export function useInfiniteActivityLogs(params?: Omit<GetActivityLogsParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...ACTIVITY_LOGS_QUERY_KEYS.LIST, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => {
      return getActivityLogs({
        ...params,
        page: pageParam,
        perPage: params?.perPage || 100, // Default to 100 per page
      });
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta?.currentPage || 1;
      const lastPageNum = lastPage.meta?.lastPage || 1;
      return currentPage < lastPageNum ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: ACTIVITY_LOGS_QUERY_CONFIG.STALE_TIME,
    refetchOnWindowFocus: false, // Prevent automatic refetch on window focus
    // Don't retry on 401/403 errors (permission denied)
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        return false; // Don't retry permission errors
      }
      return failureCount < 3; // Retry other errors up to 3 times
    },
  });
}

