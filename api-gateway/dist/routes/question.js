"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionRouter = void 0;
const express_1 = require("express");
const jwt_1 = require("../middleware/jwt");
const proxy_1 = require("../middleware/proxy");
const shared_1 = require("shared");
const router = (0, express_1.Router)();
exports.questionRouter = router;
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_BASE_URL;
// role-based access per method to avoid overlapping since user and admin have same route paths /api/question
router.get("/api/question", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.USER, shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.httpProxy)(QUESTION_SERVICE_URL));
router.post("/api/question", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.httpProxy)(QUESTION_SERVICE_URL));
router.get("/api/question/random", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.USER, shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.httpProxy)(QUESTION_SERVICE_URL));
router.get("/api/question/:id", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.USER, shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.httpProxy)(QUESTION_SERVICE_URL));
router.put("/api/question/:id", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.httpProxy)(QUESTION_SERVICE_URL));
router.delete("/api/question/:id", jwt_1.verifyAccessToken, (0, jwt_1.authorizedRoles)([shared_1.UserRole.ADMIN]), jwt_1.attachUserFromJwt, (0, proxy_1.httpProxy)(QUESTION_SERVICE_URL));
