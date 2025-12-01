import z from "zod";

/**
 * Schema for pagination link objects in meta.links array
 */
export const paginationLinkSchema = z.object({
    url: z.string().nullable(),
    label: z.string(),
    page: z.number().nullable(),
    active: z.boolean(),
});

/**
 * Schema for top-level pagination links
 */
export const paginationLinksSchema = z.object({
    first: z.string().nullable(),
    last: z.string().nullable(),
    prev: z.string().nullable(),
    next: z.string().nullable(),
});

/**
 * Schema for pagination meta information
 */
export const paginationMetaSchema = z.object({
    current_page: z.number(),
    from: z.number(),
    last_page: z.number(),
    links: z.array(paginationLinkSchema),
    path: z.string(),
    per_page: z.number(),
    to: z.number(),
    total: z.number(),
});

/**
 * Generic paginated response schema
 * @template T - The schema type for items in the data array
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        data: z.array(itemSchema),
        links: paginationLinksSchema,
        meta: paginationMetaSchema,
        message: z.string().optional(),
    });

/**
 * Type helper for paginated responses
 */
export type PaginatedResponse<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: Array<{
            url: string | null;
            label: string;
            page: number | null;
            active: boolean;
        }>;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    message?: string;
};

/**
 * Pre-defined paginated response schemas for common types
 */
export const paginatedStaffResponseSchema = paginatedResponseSchema(
    z.any() // Replace with staffSchema when imported
);

export const paginatedUserResponseSchema = paginatedResponseSchema(
    z.any() // Replace with userSchema when imported
);
