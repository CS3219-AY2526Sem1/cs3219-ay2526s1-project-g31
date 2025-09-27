import WebSocket, { Server as WebSocketServer } from "ws";

const clients = new Map<string, WebSocket>();

export const setupWebSocket = (server: any) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws: WebSocket) => {
        console.log("[WS] New WebSocket connection");

        ws.on("message", (message) => {
            try {
                const data = JSON.parse(message.toString());

                if (data.type === "register" && typeof data.userId === "string") {
                    clients.set(data.userId, ws);
                    console.log(`[WS] Registered WebSocket for user: ${data.userId}`);
                } else {
                    console.warn("[WS] Invalid register message:", data);
                }
            } catch (err) {
                console.error("[WS] Invalid message format:", err);
            }
        });

        ws.on("close", () => {
            for (const [userId, socket] of clients.entries()) {
                if (socket === ws) {
                    clients.delete(userId);
                    console.log(`[WS] WebSocket disconnected and removed for user: ${userId}`);
                    break;
                }
            }
        });

        ws.on("error", (err) => console.error("[WS] WebSocket error:", err));
    });

    return wss;
};

export const notifyMatch = (userA: string, userB: string) => {
    [userA, userB].forEach(userId => {
        const socket = clients.get(userId);

        if (socket && socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(JSON.stringify({
                    type: "match",
                    partner: userId === userA ? userB : userA
                }));
                console.log(`[WS] Sent match notification to ${userId}`);
            } catch (err) {
                console.error(`[WS] Failed to send match to ${userId}:`, err);
            }
        } else {
            console.warn(`[WS] No active WebSocket for user: ${userId}`);
        }
    });
};
