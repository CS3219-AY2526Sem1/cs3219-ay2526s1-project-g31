import { Server } from "ws";
import { registerFrontendClient } from "./wsClient";

export function setupFrontendWebSocket(server: any) {
    const wss = new Server({ server });

    wss.on("connection", (socket) => {
        console.log("[WS SERVER] Frontend connected");
        registerFrontendClient(socket);
        console.log(`[WS SERVER] Total clients: ${wss.clients.size}`);
    });
}
