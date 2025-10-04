import { Request } from 'express';
import { expressjwt } from 'express-jwt';
import type { RequestHandler } from 'express';

/**
 * Middleware to verify JWT access token from Authorization header
 * 
 * Automatically extracts and verifies the token
 */
export const verifyAccessToken: RequestHandler = expressjwt({
    secret: process.env.JWT_ACCESS_SECRET!,
    algorithms: ['HS256'],
    requestProperty: 'auth',
});

/**
 * Extended Request interface to include auth property after using verifyAccessToken middleware
 */
export interface JwtRequest extends Request {
    auth?: {
        userId: string;
        iat: number;
        exp: number;
    };
}