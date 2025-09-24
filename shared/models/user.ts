export interface User {
    id: string;
    google_id: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
    email?: string;
    lastLogin?: Date;
    createdAt?: Date;
    lastUpdated?: Date;
}