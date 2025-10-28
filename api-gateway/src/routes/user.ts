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
userRouter.use("/api/user/me",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(USER_SERVICE_URL, "/api/user/me")
);

// Admin-only user routes - /api/user/search and /api/user/:id
userRouter.use("/api/user/search",
    verifyAccessToken,
    authorizedRoles([UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(USER_SERVICE_URL, "/api/user/search")
);

userRouter.use("/api/user/:id",
    verifyAccessToken,
    authorizedRoles([UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(USER_SERVICE_URL, undefined, undefined, (path, req) => {
        const id = req.params.id;
        return `/api/user/${id}`;
    })
);

export { userRouter };