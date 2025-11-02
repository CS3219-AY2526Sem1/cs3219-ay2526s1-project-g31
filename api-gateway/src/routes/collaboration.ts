import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const collaborationRouter = Router();
const COLLABORATION_SERVICE_URL = process.env.COLLABORATION_SERVICE_BASE_URL!;

// add your endpoints here, including the socket endpoint
// see other route files for examples

export { collaborationRouter };