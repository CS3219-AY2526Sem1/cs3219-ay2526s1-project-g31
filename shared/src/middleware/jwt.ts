import { Request } from 'express';
import { expressjwt } from 'express-jwt';
import type { RequestHandler } from 'express';
import { UserRole } from '../models/user';

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
 * Middleware to authorize user roles
 * @param roles 
 * @returns 
 */
export const authorizedRoles = (roles: UserRole[]): RequestHandler => {
    return (req: JwtRequest, res, next) => {
        const userRole = req.auth?.userRole;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};

/**
 * Extended Request interface to include auth property after using verifyAccessToken middleware
 */
export interface JwtRequest extends Request {
    auth?: {
        userId: string;
        userRole: UserRole;
        iat: number;
        exp: number;
    };
}