import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const questionRouter = Router();
const QUESTION_SERVICE_URL = `http://${process.env.BASE_URL}:${process.env.QUESTION_SERVICE_PORT}`;

questionRouter.use("/api/question",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(QUESTION_SERVICE_URL, "/api/question"),
);


export { questionRouter };