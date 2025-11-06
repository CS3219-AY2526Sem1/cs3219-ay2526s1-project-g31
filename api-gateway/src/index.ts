import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

import http from "http";
import net from "net";
import app from "./server";
import { wsMatchingProxy, wsCollaborationProxy } from "./server";

const PORT = process.env.API_GATEWAY_PORT;
const server = http.createServer(app);

// createProxyMiddleware does not handle upgrade events on first try properly
// ensures initial ws connections are handled correctly
server.on("upgrade", (req, socket, head) => {
    if (req.url!.startsWith("/socket/matching")) {
        wsMatchingProxy.upgrade(req, socket as net.Socket, head);
    } else if (req.url!.startsWith("/socket/collaboration")) {
        wsCollaborationProxy.upgrade(req, socket as net.Socket, head);
    }
});
server.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});