"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const aiRoute_1 = __importDefault(require("./routes/aiRoute"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
console.log(process.env.UI_BASE_URL);
app.use((0, cors_1.default)({
    origin: process.env.UI_BASE_URL,
    credentials: true,
}));
// same as the rest of the services
app.use("/api/ai", aiRoute_1.default);
app.get("/", (req, res) => res.send("AI Service is running!"));
const server = http_1.default.createServer(app);
exports.default = server;
