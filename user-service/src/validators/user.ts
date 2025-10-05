import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const updateMeSchema = z.object({
    displayName: z.string().min(1, 'Display name cannot be empty').max(50).optional(),
    picture: z.url('Picture must be a valid URL').optional(),
}).refine((data: Record<string, unknown>) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});

export const searchUsersQuerySchema = z.object({
    q: z.string().trim().min(1, "Query parameter 'q' is required"),
});

export const adminUpdateUserSchema = z.object({
    displayName: z.string().min(1).max(50).optional(),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    picture: z.url().optional(),
    email: z.email().optional(),
    role: z.enum([UserRole.USER, UserRole.ADMIN]).optional(),
}).refine((data: Record<string, unknown>) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});

export const idParamSchema = z.object({
    id: z.string().min(1),
});
