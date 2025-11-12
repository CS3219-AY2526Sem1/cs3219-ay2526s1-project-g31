import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export const JWT_REFRESH_EXPIRES_DAYS = 7;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_ACCESS_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = `${JWT_REFRESH_EXPIRES_DAYS}d`;

export interface JWTPayload {
    userId: string;
    userRole?: UserRole;
    iat?: number;
    exp?: number;
}

export interface RefreshTokenPayload extends JWTPayload {
    tokenId: string;
}

/**
 * Generate an access token
 * @param userId 
 * @param userRole 
 * @returns 
 */
export function generateAccessToken(userId: string, userRole: UserRole) {
    return jwt.sign(
        { userId, userRole } as JWTPayload,
        JWT_ACCESS_SECRET,
        { expiresIn: JWT_ACCESS_EXPIRES_IN, algorithm: 'HS256' } as any
    );
}

/**
 * Generate a refresh token
 * @param userId 
 * @param tokenId 
 * @returns 
 */
export function generateRefreshToken(userId: string, tokenId: string) {
    return jwt.sign(
        { userId, tokenId } as RefreshTokenPayload,
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN, algorithm: 'HS256' } as any
    );
}