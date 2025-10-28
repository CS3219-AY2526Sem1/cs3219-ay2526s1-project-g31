import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const matchRouter = Router();
const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_BASE_URL!;

matchRouter.use("/api/match",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(MATCHING_SERVICE_URL, "/api/match"),
);

matchRouter.use("/socket/matching",
    proxyMiddleware(MATCHING_SERVICE_URL, "/socket/matching", true)
);

export { matchRouter };