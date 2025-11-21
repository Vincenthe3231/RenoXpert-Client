import z from "zod";

/**
 * Schema for pagination link objects
 */
export const paginationLinkSchema = z.object({
    url: z.string().nullable().optional(),
    label: z.string().optional(),
    page: z.number().optional(),
    active: z.boolean().optional(),
});

/**
 * Generic paginated response schema
 * @template T - The schema type for items in the data array
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        data: z.object({
            currentPage: z.number(),
            data: z.array(itemSchema),
            firstPageUrl: z.string().url(),
            from: z.number(),
            lastPage: z.number(),
            lastPageUrl: z.string().url(),
            links: z.array(paginationLinkSchema),
            nextPageUrl: z.string().url().nullable(),
            path: z.string().url(),
            perPage: z.number(),
            prevPageUrl: z.string().url().nullable(),
            to: z.number(),
            total: z.number(),
        }),
    });

/**
 * Type helper for paginated responses
 */
export type PaginatedResponse<T> = {
    data: {
        currentPage: number;
        data: T[];
        firstPageUrl: string;
        from: number;
        lastPage: number;
        lastPageUrl: string;
        links: Array<{
            url?: string | null;
            label?: string;
            page?: number;
            active?: boolean;
        }>;
        nextPageUrl: string | null;
        path: string;
        perPage: number;
        prevPageUrl: string | null;
        to: number;
        total: number;
    };
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
