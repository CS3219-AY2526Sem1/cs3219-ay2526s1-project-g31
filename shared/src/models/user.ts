// NOTE: keep in sync with @prisma/client UserRole enum
export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export type UserRoleType = 'USER' | 'ADMIN';

export interface User {
    id: string;
    google_id: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
    email?: string;
    role?: UserRoleType;
    lastLogin?: Date;
    createdAt?: Date;
    lastUpdated?: Date;
}