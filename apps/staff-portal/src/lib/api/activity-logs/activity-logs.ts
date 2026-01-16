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

  console.log("Fetching activity logs with params:", queryParams);
  
  try {
    const { data } = await axios.get("/api/activity-logs", { params: queryParams });
    
    console.log("Raw activity logs response:", data);
    console.log("Response type:", typeof data);
    console.log("Response keys:", data && typeof data === 'object' ? Object.keys(data) : 'N/A');
    
    // Try to extract data array even if structure is different
    let dataArray = [];
    if (Array.isArray(data)) {
      dataArray = data;
    } else if (data?.data && Array.isArray(data.data)) {
      dataArray = data.data;
    }
    
    console.log("Extracted data array length:", dataArray.length);
    if (dataArray.length > 0) {
      console.log("First item in array:", dataArray[0]);
      console.log("First item keys:", Object.keys(dataArray[0]));
    }
    
    const result = activityLogListSchema.safeParse(data);
    if (!result.success) {
      console.error("Activity logs data validation failed:");
      console.error("Validation errors:", JSON.stringify(result.error.issues, null, 2));
      console.error("Full received data:", JSON.stringify(data, null, 2));
      
      // Try to return a partial response if we can extract some data
      if (dataArray.length > 0) {
        console.warn("Returning partial data despite validation failure");
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
    
    console.log("Validated activity logs count:", result.data.data.length);
    return result.data;
  } catch (error: any) {
    console.error("Error fetching activity logs:", error);
    console.error("Error response:", error?.response?.data);
    throw error; // Re-throw to let React Query handle it
  }
}

