import { z } from "zod";

// User credentials schema for registration and login
export const userCredentialsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Login credentials schema (without name)
export const loginCredentialsSchema = userCredentialsSchema.omit({ name: true });

// Change email schema
export const changeEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// User select schema (for API responses)
export const userSelectSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  email_verified_at: z.string().nullable(),
  larksuite_open_id: z.string().nullable(),
  larksuite_union_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  password: z.string().optional(), // Only for internal use
});

// Auth response schema
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSelectSchema.omit({ password: true }),
});

// Current user response schema
export const currentUserResponseSchema = z.object({
  accessToken: z.string().nullable(),
  currentUser: userSelectSchema.omit({ password: true }).nullable(),
});

export type UserCredentials = z.infer<typeof userCredentialsSchema>;
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type ChangeEmailData = z.infer<typeof changeEmailSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UserSelect = z.infer<typeof userSelectSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
