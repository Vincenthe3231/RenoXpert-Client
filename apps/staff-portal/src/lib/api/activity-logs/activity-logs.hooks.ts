import { keepPreviousData, useQuery, queryOptions } from "@tanstack/react-query";
import { ACTIVITY_LOGS_QUERY_KEYS, ACTIVITY_LOGS_QUERY_CONFIG } from "./constants";
import { getActivityLogs } from "./activity-logs";
import { GetActivityLogsParams, ActivityLogListResponse } from "./activity-logs.schemas";

/**
 * Query options factory for activity logs list
 */
export function activityLogsQueryOptions(params?: GetActivityLogsParams) {
  return queryOptions({
    queryKey: [...ACTIVITY_LOGS_QUERY_KEYS.LIST, params],
    queryFn: () => getActivityLogs(params),
    placeholderData: keepPreviousData,
    staleTime: ACTIVITY_LOGS_QUERY_CONFIG.STALE_TIME,
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

