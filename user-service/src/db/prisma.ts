import { PrismaClient } from '@prisma/client';

declare global {
    // Avoid multiple instances in development due to hot reloads
    // @ts-ignore
    var prisma: PrismaClient | undefined;
}

// Singleton Prisma Client instance
export const prisma: PrismaClient =
    global.prisma || new PrismaClient();

// In development, attach the client to the global object
// so hot reloads don't create new instances
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
