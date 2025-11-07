"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchRouter = void 0;
const express_1 = require("express");
const jwt_1 = require("../middleware/jwt");
const proxy_1 = require("../middleware/proxy");
const shared_1 = require("shared");
const matchRouter = (0, express_1.Router)();
exports.matchRouter = matchRouter;
const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_BASE_URL;
matchRouter.post("/api/match/start", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.USER, shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.proxyMiddleware)(MATCHING_SERVICE_URL));
// socket.io verifies access token, no need to re-verify here
matchRouter.use("/socket/matching", (0, proxy_1.proxyMiddleware)(MATCHING_SERVICE_URL, "/socket/matching", true));
