import axios from "axios";
import {
  GetActivityLogsParams,
  ActivityLogListResponse,
  getActivityLogsParamsSchema,
  activityLogListSchema,
} from "./activity-logs.schemas";

/**
 * Get activity logs from the API
 * 
 * @param params - Query parameters including filters, pagination, and sorting
 * @returns Promise resolving to activity logs list response
 */
export async function getActivityLogs(
  params?: GetActivityLogsParams
): Promise<ActivityLogListResponse> {
  if (params) {
    getActivityLogsParamsSchema.parse(params);
  }

  // Build query string with filter parameters
  const queryParams: Record<string, any> = {};
  
  if (params?.page) {
    queryParams.page = params.page;
  }
  
  if (params?.perPage) {
    queryParams.per_page = params.perPage;
  }
  
  if (params?.sort) {
    queryParams.sort = params.sort;
  }

  // Handle filter parameters - convert to filter[key] format
  const filterParams: Record<string, string> = {};
  
  if (params?.["filter[log_name]"]) {
    filterParams["filter[log_name]"] = params["filter[log_name]"];
  }
  
  if (params?.["filter[event]"]) {
    filterParams["filter[event]"] = params["filter[event]"];
  }
  
  if (params?.["filter[causer_id]"]) {
    filterParams["filter[causer_id]"] = String(params["filter[causer_id]"]);
  }
  
  if (params?.["filter[subject_id]"]) {
    filterParams["filter[subject_id]"] = String(params["filter[subject_id]"]);
  }
  
  if (params?.["filter[subject_type]"]) {
    filterParams["filter[subject_type]"] = params["filter[subject_type]"];
  }

  // Merge filter params into query params
  Object.assign(queryParams, filterParams);

  try {
    const { data } = await axios.get("/api/activity-logs", { params: queryParams });
    
    // Try to extract data array even if structure is different
    let dataArray = [];
    if (Array.isArray(data)) {
      dataArray = data;
    } else if (data?.data && Array.isArray(data.data)) {
      dataArray = data.data;
    }
    
    const result = activityLogListSchema.safeParse(data);
    if (!result.success) {
      // Only log validation errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn("Activity logs data validation failed:", result.error.issues);
      }
      
      // Try to return a partial response if we can extract some data
      if (dataArray.length > 0) {
        return {
          data: dataArray as any[], // Cast to any to bypass type checking
          links: data?.links || {
            first: null,
            last: null,
            prev: null,
            next: null,
          },
          meta: data?.meta || {
            currentPage: 1,
            lastPage: 1,
            perPage: 15,
            total: dataArray.length,
          },
        };
      }
      
      // Return empty response if we can't extract data
      return {
        data: [],
        links: {
          first: null,
          last: null,
          prev: null,
          next: null,
        },
        meta: {
          currentPage: 1,
          lastPage: 1,
          perPage: 15,
          total: 0,
        },
      };
    }
    
    return result.data;
  } catch (error: any) {
    // Handle 401/403 errors gracefully - user doesn't have permission
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      // Return empty response instead of throwing - this is expected for non-super-admin users
      // Don't log these errors as they're expected behavior
      return {
        data: [],
        links: {
          first: null,
          last: null,
          prev: null,
          next: null,
        },
        meta: {
          currentPage: 1,
          lastPage: 1,
          perPage: 15,
          total: 0,
        },
      }
    }
    
    // Only log unexpected errors (not 401/403) in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching activity logs:", error);
      console.error("Error response:", error?.response?.data);
    }
    throw error; // Re-throw to let React Query handle it
  }
}

