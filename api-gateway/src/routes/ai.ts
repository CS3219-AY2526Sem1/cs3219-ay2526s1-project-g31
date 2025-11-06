import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { httpProxy } from "../middleware/proxy";
import { UserRole } from "shared";

const aiRouter = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_BASE_URL!;

aiRouter.post(
    "/api/ai/explain",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    httpProxy(AI_SERVICE_URL)
)

aiRouter.post(
    "/api/ai/hint",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    httpProxy(AI_SERVICE_URL)
)

aiRouter.post(
    "/api/ai/suggest",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    httpProxy(AI_SERVICE_URL)
)

aiRouter.post(
    "/api/ai/testcases",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    httpProxy(AI_SERVICE_URL)
)

aiRouter.post(
    "/api/ai/debug",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    httpProxy(AI_SERVICE_URL)
)

aiRouter.post(
    "/api/ai/refactor",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    httpProxy(AI_SERVICE_URL)
)

aiRouter.post(
    "/api/ai/clear",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    httpProxy(AI_SERVICE_URL)
)

export { aiRouter };