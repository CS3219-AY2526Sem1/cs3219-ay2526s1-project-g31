import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const router = Router();
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_BASE_URL!;

// role-based access per method to avoid overlapping since user and admin have same route paths /api/question
router.get(
  "/api/question",
  verifyAccessToken,
  authorizedRoles([UserRole.USER, UserRole.ADMIN]),
  attachUserFromJwt,
  proxyMiddleware(QUESTION_SERVICE_URL)
);

router.post(
  "/api/question",
  verifyAccessToken,
  authorizedRoles([UserRole.ADMIN]),
  attachUserFromJwt,
  proxyMiddleware(QUESTION_SERVICE_URL)
);

router.get(
  "/api/question/random",
  verifyAccessToken,
  authorizedRoles([UserRole.USER, UserRole.ADMIN]),
  attachUserFromJwt,
  proxyMiddleware(QUESTION_SERVICE_URL)
);

router.get(
  "/api/question/:id",
  verifyAccessToken,
  authorizedRoles([UserRole.USER, UserRole.ADMIN]),
  attachUserFromJwt,
  proxyMiddleware(QUESTION_SERVICE_URL)
);

router.put(
  "/api/question/:id",
  verifyAccessToken,
  authorizedRoles([UserRole.ADMIN]),
  attachUserFromJwt,
  proxyMiddleware(QUESTION_SERVICE_URL)
);

router.delete(
  "/api/question/:id",
  verifyAccessToken,
  authorizedRoles([UserRole.ADMIN]),
  attachUserFromJwt,
  proxyMiddleware(QUESTION_SERVICE_URL)
);

export { router as questionRouter };
