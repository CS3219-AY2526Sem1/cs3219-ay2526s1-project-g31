"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUserFromJwt = exports.authorizedRoles = exports.verifyAccessToken = void 0;
const express_jwt_1 = require("express-jwt");
/**
 * Middleware to verify JWT access token from Authorization header
 *
 * Automatically extracts and verifies the token
 */
exports.verifyAccessToken = (0, express_jwt_1.expressjwt)({
    secret: process.env.JWT_ACCESS_SECRET,
    algorithms: ['HS256'],
    requestProperty: 'auth',
});
/**
 * Middleware to authorize user roles
 * @param roles
 * @returns
 */
const authorizedRoles = (roles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userRole;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};
exports.authorizedRoles = authorizedRoles;
/**
 * Middleware to attach user info from JWT to request headers for downstream services
 */
const attachUserFromJwt = (req, res, next) => {
    if (req.auth) {
        req.headers['x-user-id'] = req.auth.userId;
        req.headers['x-user-role'] = req.auth.userRole;
    }
    next();
};
exports.attachUserFromJwt = attachUserFromJwt;
