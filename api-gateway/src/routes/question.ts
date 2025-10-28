import { Router } from "express";
import { verifyAccessToken, authorizedRoles, attachUserFromJwt } from "../middleware/jwt";
import { proxyMiddleware } from "../middleware/proxy";
import { UserRole } from "shared";

const questionRouter = Router();
const QUESTION_SERVICE_URL = `http://${process.env.BASE_URL}:${process.env.QUESTION_SERVICE_PORT}`;

// NOTE: 
// generically set all GET requests under /api/question/* to USER + ADMIN
// and all other methods(POST, PUT, DELETE) to ADMIN only
// this can be modified later if more fine grained control is needed

questionRouter.route("/api/question/")
    // GET: USER + ADMIN
    .get(
        verifyAccessToken,
        authorizedRoles([UserRole.USER, UserRole.ADMIN]),
        attachUserFromJwt,
        proxyMiddleware(QUESTION_SERVICE_URL)
    )
    // POST: ADMIN only
    .post(
        verifyAccessToken,
        authorizedRoles([UserRole.ADMIN]),
        attachUserFromJwt,
        proxyMiddleware(QUESTION_SERVICE_URL, "/api/question")
    );

questionRouter.use("/api/question/random",
    verifyAccessToken,
    authorizedRoles([UserRole.USER, UserRole.ADMIN]),
    attachUserFromJwt,
    proxyMiddleware(QUESTION_SERVICE_URL, "/api/question/random")
);

export { questionRouter };