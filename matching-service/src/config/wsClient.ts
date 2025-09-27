import WebSocket from "ws";

let ws: WebSocket | null = null;
let userId: string | null = null;
let reconnectInterval: NodeJS.Timeout | null = null;

const RECONNECT_DELAY = 2000;

export function connectToMatchingService(uid: string) {
    userId = uid;

    const connect = () => {
        ws = new WebSocket("ws://localhost:3002");

        ws.on("open", () => {
            console.log("[WS CLIENT] Connected to matching service");
            if (userId) {
                ws!.send(JSON.stringify({ type: "register", userId }));
            }
            
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
                reconnectInterval = null;
            }
        });

        ws.on("message", (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log("[WS CLIENT] Received:", data);

                if (data.type === "match") {
                    broadcastMatch(data.partner);
                }
            } catch (err) {
                console.error("[WS CLIENT] Failed to parse message:", err, message.toString());
            }
        });

        ws.on("close", () => {
            console.log("[WS CLIENT] Connection closed");
            attemptReconnect();
        });

        ws.on("error", (err) => {
            console.error("[WS CLIENT] Connection error:", err);
            ws?.close();
        });
    };

    const attemptReconnect = () => {
        if (!reconnectInterval) {
            console.log(`[WS CLIENT] Attempting reconnect in ${RECONNECT_DELAY}ms...`);
            reconnectInterval = setInterval(() => {
                console.log("[WS CLIENT] Reconnecting...");
                connect();
            }, RECONNECT_DELAY);
        }
    };

    connect();
}

export function stopMatching() {
    if (ws && ws.readyState === WebSocket.OPEN && userId) {
        ws.send(JSON.stringify({ type: "unregister", userId }));
        ws.close();
    }
    ws = null;
    userId = null;
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
}

const frontendClients = new Set<WebSocket>();

export function registerFrontendClient(client: WebSocket) {
    frontendClients.add(client);

    client.on("close", () => frontendClients.delete(client));
}

function broadcastMatch(partner: any) {
    for (const client of frontendClients) {
        try {
            client.send(JSON.stringify({ type: "match", partner }));
        } catch (err) {
            console.error("[WS CLIENT] Failed to send match:", err);
        }
    }
}
