import { z } from "zod";
import { userSchema } from "../auth/auth.schemas";

/**
 * Activity Log Event Types
 */
export const activityLogEventSchema = z.enum([
  "deactivated",
  "activated",
  "role_changed",
  "profile_updated",
]);

/**
 * Activity Log Name
 */
export const activityLogNameSchema = z.enum(["user"]);

/**
 * Activity Log Properties (dynamic, can contain various fields)
 */
export const activityLogPropertiesSchema = z.record(z.any());

/**
 * Activity Log Causer (who performed the action)
 * Can be a full user object or a partial user object with at least id/name
 */
export const activityLogCauserSchema = z.any().nullable(); // Use any to avoid Zod union issues

/**
 * Activity Log Subject (the entity being modified)
 * Can be a full user object or a partial user object with at least id/name
 * Backend may also return subjectId and subjectType instead
 */
export const activityLogSubjectSchema = z.any().nullable(); // Use any to avoid Zod union issues

/**
 * Activity Log Entry Schema
 * Made lenient to handle various response formats from backend
 * Backend returns: id, logName, description, event, subjectType, subjectId, causerType, causerId, causer, properties, createdAt
 */
export const activityLogSchema = z.object({
  id: z.number(),
  logName: z.string().optional(), // Allow any string
  description: z.string().optional(), // Backend includes description
  event: z.string(), // Allow any string for flexibility
  // Subject can be either an object OR just IDs
  subject: z.any().optional().nullable(), // Subject object (if present)
  subjectId: z.number().optional(), // Subject ID (if subject object not present)
  subjectType: z.string().optional(), // Subject type (if subject object not present)
  // Causer can be either an object OR just IDs
  causer: z.any().optional().nullable(), // Causer object (if present)
  causerId: z.number().optional(), // Causer ID (if causer object not present)
  causerType: z.string().optional(), // Causer type (if causer object not present)
  properties: z.any().optional(), // Make optional and use any
  createdAt: z.string(), // Accept any date string
  updatedAt: z.string().nullable().optional(),
}).passthrough(); // Allow extra fields

/**
 * Activity Log List Response Schema
 * Backend may wrap response in { message: "...", data: [...], meta: {...}, links: {...} }
 */
export const activityLogListSchema = z.object({
  message: z.string().optional(), // Backend includes message
  data: z.array(activityLogSchema),
  links: z.object({
    first: z.string().url().nullable().optional(),
    last: z.string().url().nullable().optional(),
    prev: z.string().url().nullable().optional(),
    next: z.string().url().nullable().optional(),
  }).optional(),
  meta: z.object({
    currentPage: z.number().optional(),
    lastPage: z.number().optional(),
    perPage: z.number().optional(),
    total: z.number().optional(),
  }).optional(),
}).passthrough();

/**
 * Get Activity Logs Parameters Schema
 */
export const getActivityLogsParamsSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  sort: z.string().optional(),
  "filter[log_name]": z.string().optional(),
  "filter[event]": z.string().optional(),
  "filter[causer_id]": z.number().optional(),
  "filter[subject_id]": z.number().optional(),
  "filter[subject_type]": z.string().optional(),
});

// Type exports
export type ActivityLog = z.infer<typeof activityLogSchema>;
export type ActivityLogListResponse = z.infer<typeof activityLogListSchema>;
export type GetActivityLogsParams = z.infer<typeof getActivityLogsParamsSchema>;
export type ActivityLogEvent = z.infer<typeof activityLogEventSchema>;
export type ActivityLogName = z.infer<typeof activityLogNameSchema>;

