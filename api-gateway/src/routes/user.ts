import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const userRouter = Router();
const USER_SERVICE_URL = process.env.USER_SERVICE_BASE_URL!;

// NOTE: enforce specific before general routes(order matters)

// Public auth routes (no authentication required)
userRouter.use("/api/auth", proxyMiddleware(USER_SERVICE_URL, "/api/auth"));

// Admin and user accessible routes - /api/user/me
userRouter.all("/api/user/me",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(USER_SERVICE_URL)
);

// Admin-only user routes - /api/user/search and /api/user/:id
userRouter.get("/api/user/search",
    verifyAccessToken,
    authorizedRoles([UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(USER_SERVICE_URL)
);

userRouter.all("/api/user/:id",
    verifyAccessToken,
    authorizedRoles([UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(USER_SERVICE_URL)
);

export { userRouter };