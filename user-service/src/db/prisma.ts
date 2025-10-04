import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient to be used across the app
export const prisma = new PrismaClient();