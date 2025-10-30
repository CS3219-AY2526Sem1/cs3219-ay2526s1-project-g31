import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const collaborationRouter = Router();
const COLLABORATION_SERVICE_URL = process.env.COLLABORATION_SERVICE_BASE_URL!;

collaborationRouter.use("/api/collaboration",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL, "/api/collaboration"),
);

collaborationRouter.use("/api/room",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL, "/api/room"),
);

collaborationRouter.use("/socket/collaboration",
    proxyMiddleware(COLLABORATION_SERVICE_URL, "/socket/collaboration", true)
);

export { collaborationRouter };