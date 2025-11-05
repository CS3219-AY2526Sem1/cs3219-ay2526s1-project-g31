import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const collaborationRouter = Router();
const COLLABORATION_SERVICE_URL = process.env.COLLABORATION_SERVICE_BASE_URL!;

collaborationRouter.post(
    "/api/roomSetup/me",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.get(
    "/api/roomSetup/users/:userId/:matchedUserId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.post(
    "/api/roomSetup/join/:roomId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
)

collaborationRouter.post(
    "/api/roomSetup/room/:userId/:matchedUserId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.post(
    "/api/roomSetup/close/:roomId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.post(
    "/api/roomSetup/cancel/:roomId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.post(
    "/api/roomSetup/clear/:roomId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.get(
    "/api/roomSetup/codespace/:roomId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.post(
    "/api/roomSetup/message/:roomId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.post(
    "/api/roomSetup/ai-message/:roomId",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(COLLABORATION_SERVICE_URL)
);

collaborationRouter.use("/socket/collaboration",
    proxyMiddleware(COLLABORATION_SERVICE_URL, "/socket/collaboration", true)
);

export { collaborationRouter };