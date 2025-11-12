import { prisma } from '../db/prisma';
import { randomUUID } from 'crypto';
import { JWT_REFRESH_EXPIRES_DAYS } from './jwt';

/**
 * AI Assistance Disclosure
 * Tool: Microsoft Copilot
 * Scope: Debugged prisma calls.
 * Author review: Validated correctness.
 */

/**
 * Create a new refresh token record in the database
 */
export async function createRefreshToken(userId: string): Promise<string> {
    const tokenId = randomUUID(); // refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + JWT_REFRESH_EXPIRES_DAYS);

    await prisma.refreshToken.create({
        data: {
            tokenId,
            userId,
            expiresAt
        }
    });

    return tokenId;
}

/**
 * Revoke a specific refresh token
 */
export async function deleteRefreshToken(tokenId: string): Promise<string | null> {
    const deletedToken = await prisma.refreshToken.deleteMany({
        where: { tokenId }
    });
    return deletedToken.count > 0 ? tokenId : null;
}

/**
 * Validate a refresh token and return user ID if valid
 */
export async function validateRefreshToken(tokenId: string): Promise<string | null> {
    const token = await prisma.refreshToken.findUnique({
        where: { tokenId },
        include: { user: true }
    });

    if (!token) {
        return null;
    }

    if (token.expiresAt < new Date()) {
        await deleteRefreshToken(tokenId);
        return null;
    }

    return token.userId;
}
