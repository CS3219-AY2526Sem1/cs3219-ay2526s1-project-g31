import { prisma } from '../db/prisma';
import { randomUUID } from 'crypto';

/**
 * Create a new refresh token record in the database
 */
export async function createRefreshToken(userId: string): Promise<string> {
    const tokenId = randomUUID(); // refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

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
    const deletedToken = await prisma.refreshToken.delete({
        where: { tokenId }
    });
    return deletedToken.tokenId || null
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

// /**
//  * Revoke all refresh tokens for a user (useful for logout from all devices)
//  */
// export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
//     await prisma.refreshToken.updateMany({
//         where: { userId },
//         data: { isRevoked: true }
//     });
// }

// /**
//  * Clean up expired refresh tokens (should be called periodically)
//  */
// export async function cleanupExpiredTokens(): Promise<void> {
//     await prisma.refreshToken.deleteMany({
//         where: {
//             OR: [
//                 { expiresAt: { lt: new Date() } },
//                 { isRevoked: true }
//             ]
//         }
//     });
// }

// /**
//  * Get all active refresh tokens for a user
//  */
// export async function getUserActiveRefreshTokens(userId: string): Promise<number> {
//     const count = await prisma.refreshToken.count({
//         where: {
//             userId,
//             isRevoked: false,
//             expiresAt: { gte: new Date() }
//         }
//     });

//     return count;
// }