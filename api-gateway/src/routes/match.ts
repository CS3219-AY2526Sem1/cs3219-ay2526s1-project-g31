import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const matchRouter = Router();
const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_BASE_URL!;

matchRouter.post(
    "/api/match/start",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(MATCHING_SERVICE_URL),
);

// socket.io verifies access token, no need to re-verify here
matchRouter.use("/socket/matching",
    proxyMiddleware(MATCHING_SERVICE_URL, "/socket/matching", true)
);

export { matchRouter };