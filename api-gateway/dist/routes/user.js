"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const jwt_1 = require("../middleware/jwt");
const proxy_1 = require("../middleware/proxy");
const shared_1 = require("shared");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
const USER_SERVICE_URL = process.env.USER_SERVICE_BASE_URL;
// NOTE: enforce specific before general routes(order matters)
// Public auth routes (no authentication required)
userRouter.use("/api/auth", (0, proxy_1.proxyMiddleware)(USER_SERVICE_URL, "/api/auth"));
// Admin and user accessible routes - /api/user/me
userRouter.all("/api/user/me", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.USER, shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.proxyMiddleware)(USER_SERVICE_URL));
// Admin-only user routes - /api/user/search and /api/user/:id
userRouter.get("/api/user/search", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.proxyMiddleware)(USER_SERVICE_URL));
userRouter.all("/api/user/:id", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.proxyMiddleware)(USER_SERVICE_URL));
