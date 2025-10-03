import * as jwt from 'jsonwebtoken';

// Get JWT secrets with fallbacks for development
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_ACCESS_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';

// JWT payload interface
export interface JWTPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

// Refresh token payload interface
export interface RefreshTokenPayload extends JWTPayload {
    tokenId: string;
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(userId: string, tokenId: string) {
    const accessToken = jwt.sign(
        { userId } as JWTPayload,
        JWT_ACCESS_SECRET,
        { expiresIn: JWT_ACCESS_EXPIRES_IN } as any,
        { algorithm: 'HS256' } as any
    );

    const refreshToken = jwt.sign(
        { userId, tokenId } as RefreshTokenPayload,
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN } as any,
        { algorithm: 'HS256' } as any
    );

    return {
        accessToken,
        refreshToken
    };
}

/**
 * Manual verification for refresh tokens (useful for non-middleware contexts)
 */
// export function verifyRefreshTokenManual(token: string): RefreshTokenPayload {
//     try {
//         return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
//     } catch (error) {
//         throw new Error('Invalid refresh token');
//     }
// }