import { Server, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { cleanupExpired } from "./redis";

interface JwtPayload {
    userId: string;
    userRole: string;
}

const wsClients = new Map<string, WebSocket>();

function extractClientId(ws: WebSocket, req: any): string | null {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");
    if (!token) {
        ws.close(4001, "Missing token");
        return null;
    }

    try {
        const { userId, userRole } = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
        if (userId) {
            if (wsClients.has(userId)) {
                ws.close(4004, "User already connected");
                return null;
            }
            wsClients.set(userId, ws);
            console.log("Authenticated user:", { userId, userRole });
            return userId;
        } else {
            ws.close(4003, "Invalid token payload");
        }
    } catch (err) {
        ws.close(4002, "Invalid or expired token");
    }
    return null;
}

function attachWebsocketServer(server: any) {
    const wss = new Server({ server });
    wss.on("connection", (ws: WebSocket, req) => {
        // client connects with ws://<base_url>/?token=<access_token>
        const clientId = extractClientId(ws, req);

        ws.on("close", () => {
            cleanupExpired(clientId!);
            wsClients.delete(clientId!);
            console.log("WebSocket disconnected for client:", clientId);
        });

    });
}

export { wsClients, attachWebsocketServer };