// import { Request, Response, NextFunction } from 'express';
// import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Custom interface for JWT user data
// export interface JWTUser {
//     userId: string;
// }

// // Extend the Request interface to include JWT user data
// declare global {
//     namespace Express {
//         interface Request {
//             jwtUser?: JWTUser;
//         }
//     }
// }

// /**
//  * JWT Authentication middleware
//  * Replaces the session-based authentication
//  */
// export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
//     try {
//         // Extract token from Authorization header
//         const token = extractTokenFromHeader(req.headers.authorization);

//         if (!token) {
//             return res.status(401).json({
//                 error: 'Access token required',
//                 authenticated: false
//             });
//         }

//         // Verify the JWT token
//         const payload: JWTPayload = verifyAccessToken(token);

//         // Optional: Verify user still exists in database
//         const user = await prisma.user.findUnique({
//             where: { id: payload.userId }
//         });

//         if (!user) {
//             return res.status(401).json({
//                 error: 'User not found',
//                 authenticated: false
//             });
//         }

//         // Attach user info to request object
//         req.jwtUser = {
//             userId: payload.userId
//         };

//         next();
//     } catch (error) {
//         console.error('JWT Authentication error:', error);
//         return res.status(401).json({
//             error: 'Invalid or expired token',
//             authenticated: false
//         });
//     }
// }

// /**
//  * Optional JWT Authentication middleware
//  * Attaches user info if token is valid, but doesn't block request if invalid
//  */
// export async function optionalAuthenticateJWT(req: Request, res: Response, next: NextFunction) {
//     try {
//         const token = extractTokenFromHeader(req.headers.authorization);

//         if (token) {
//             const payload: JWTPayload = verifyAccessToken(token);
//             const user = await prisma.user.findUnique({
//                 where: { id: payload.userId }
//             });

//             if (user) {
//                 req.jwtUser = {
//                     userId: payload.userId
//                 };
//             }
//         }

//         next();
//     } catch (error) {
//         // Don't block the request, just continue without user info
//         next();
//     }
// }