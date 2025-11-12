import { expressjwt } from 'express-jwt';
import type { Response, NextFunction, RequestHandler } from 'express';
import { UserRoleType, JwtRequest } from 'shared';

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
export const authorizedRoles = (roles: UserRoleType[]): RequestHandler => {
    return (req: JwtRequest, res, next) => {
        const userRole = req.auth?.userRole;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};

/**
 * Middleware to attach user info from JWT to request headers for downstream services
 */
export const attachUserFromJwt = (req: JwtRequest, res: Response, next: NextFunction) => {
    if (req.auth) {
        req.headers['x-user-id'] = req.auth.userId;
        req.headers['x-user-role'] = req.auth.userRole;
    }
    next();
};