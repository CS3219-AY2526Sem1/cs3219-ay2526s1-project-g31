"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsCollaborationProxy = exports.wsMatchingProxy = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_1 = require("./routes/user");
const match_1 = require("./routes/match");
const question_1 = require("./routes/question");
const collaboration_1 = require("./routes/collaboration");
const ai_1 = require("./routes/ai");
const proxy_1 = require("./middleware/proxy");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.UI_BASE_URL,
    credentials: true,
}));
app.use(user_1.userRouter);
app.use(match_1.matchRouter);
app.use(question_1.questionRouter);
app.use(collaboration_1.collaborationRouter);
app.use(ai_1.aiRouter);
exports.wsMatchingProxy = (0, proxy_1.wsProxy)(process.env.MATCHING_SERVICE_BASE_URL, '/socket/matching');
exports.wsCollaborationProxy = (0, proxy_1.wsProxy)(process.env.COLLABORATION_SERVICE_BASE_URL, '/socket/collaboration');
app.use(exports.wsMatchingProxy);
app.use(exports.wsCollaborationProxy);
app.get("/", (req, res) => {
    res.send("API Gateway is running!");
});
exports.default = app;
