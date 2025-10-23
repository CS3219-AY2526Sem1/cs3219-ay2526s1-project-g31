import jwt from "jsonwebtoken";
import { Server, WebSocket } from "ws";
import { cleanupExpired } from "./redis";
import { UserMatchInfo } from "../constants/match";

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

function notifyMatch(user1Info: UserMatchInfo, user2Info: UserMatchInfo, matchedDifficulty: string, matchedTopic: string, matchedLanguage: string) {
    wsClients.get(user1Info.userId)?.send(JSON.stringify({
        type: "match_found",
        userId: user2Info.userId,
        displayName: user2Info.displayName,
        email: user2Info.email,
        picture: user2Info.picture,
        difficulty: matchedDifficulty,
        topic: matchedTopic,
        language: matchedLanguage,
    }));

    wsClients.get(user2Info.userId)?.send(JSON.stringify({
        type: "match_found",
        userId: user1Info.userId,
        displayName: user1Info.displayName,
        email: user1Info.email,
        picture: user1Info.picture,
        difficulty: matchedDifficulty,
        topic: matchedTopic,
        language: matchedLanguage,
    }));

    closeWsConnection(user1Info.userId, 4000, "Match found");
    closeWsConnection(user2Info.userId, 4000, "Match found");
}

function closeWsConnection(userId: string, code?: number, message?: string) {
    if (message && code) {
        wsClients.get(userId)?.close(code, message);
    }
    wsClients.get(userId)?.close();
}

export { attachWebsocketServer, notifyMatch, closeWsConnection };