## Post-Merge Frontend Errors

After the merge, the frontend encountered several errors:

- **Activity Logs Fetch Error**: AxiosError with 404 status code when fetching activity logs, resulting in an empty error response object from `getActivityLogs` at `src/lib/api/activity-logs/activity-logs.ts:145`

- **Owner List Validation Failure**: Data validation failed in `getOwners` at `src/lib/api/auth/auth.ts:245`
  - API response contains owner data with fields (salutation, ic, address1, address2, city, state, postcode) directly in the data array
  - Transformation wraps these fields in a "profile" object
  - Validation schema rejects this transformed structure
  - Error thrown: "Invalid owner list data"
