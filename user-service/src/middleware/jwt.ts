import { expressjwt } from 'express-jwt';
// import { Request } from 'express';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

/**
 * Middleware to verify JWT access token from Authorization header
 * Automatically extracts and verifies the token
 */
// TOOD: move to shared lib
export const verifyAccessToken = expressjwt({
    secret: JWT_ACCESS_SECRET,
    algorithms: ['HS256'],
    requestProperty: 'auth',
});

/**
 * Middleware to verify JWT refresh token from cookies
 */
// export const verifyRefreshToken = expressjwt({
//     secret: JWT_REFRESH_SECRET,
//     algorithms: ['HS256'],
//     requestProperty: 'auth',
//     getToken: (req: Request) => {
//         return req.cookies?.refreshToken || null;
//     }
// });