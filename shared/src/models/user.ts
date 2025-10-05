// NOTE: keep in sync with @prisma/client UserRole enum
export type UserRole = 'USER' | 'ADMIN';
export interface User {
    id: string;
    google_id: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
    email?: string;
    role?: UserRole;
    lastLogin?: Date;
    createdAt?: Date;
    lastUpdated?: Date;
}