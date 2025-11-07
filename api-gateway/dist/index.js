"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env"), override: true });
const http_1 = __importDefault(require("http"));
const server_1 = __importDefault(require("./server"));
const server_2 = require("./server");
const PORT = process.env.API_GATEWAY_PORT;
const server = http_1.default.createServer(server_1.default);
// createProxyMiddleware does not handle upgrade events on first try properly
// ensures initial ws connections are handled correctly
server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/socket/matching")) {
        server_2.wsMatchingProxy.upgrade(req, socket, head);
    }
    else if (req.url.startsWith("/socket/collaboration")) {
        server_2.wsCollaborationProxy.upgrade(req, socket, head);
    }
});
server.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
