import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { cleanupExpired } from "./redis";
import { UserMatchInfo } from "../constants/match";

interface JwtPayload {
    userId: string;
    userRole: string;
}

const socketClients = new Map<string, Socket>();

function attachWebsocketServer(server: any) {
    const io = new Server(server, {
        cors: {
            origin: process.env.UI_BASE_URL,
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Missing token"));
        }

        try {
            const { userId, userRole } = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
            if (userId) {
                if (socketClients.has(userId)) {
                    return next(new Error("User already connected"));
                }
                socket.data.userId = userId;
                socket.data.userRole = userRole;
                console.log("Authenticated user:", { userId, userRole });
                next();
            } else {
                return next(new Error("Invalid token payload"));
            }
        } catch (err) {
            return next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket: Socket) => {
        const userId = socket.data.userId;
        socketClients.set(userId, socket);
        console.log(`Client connected: ${userId}`);

        socket.on("disconnect", () => {
            cleanupExpired(userId);
            socketClients.delete(userId);
            console.log("Socket disconnected for client:", userId);
        });
    });
}

function notifyMatch(user1Info: UserMatchInfo, user2Info: UserMatchInfo, matchedDifficulty: string, matchedTopic: string, matchedLanguage: string) {
    socketClients.get(user1Info.userId)?.emit("match_found", {
        userId: user2Info.userId,
        displayName: user2Info.displayName,
        email: user2Info.email,
        picture: user2Info.picture,
        difficulty: matchedDifficulty,
        topic: matchedTopic,
        language: matchedLanguage,
    });

    socketClients.get(user2Info.userId)?.emit("match_found", {
        userId: user1Info.userId,
        displayName: user1Info.displayName,
        email: user1Info.email,
        picture: user1Info.picture,
        difficulty: matchedDifficulty,
        topic: matchedTopic,
        language: matchedLanguage,
    });

    closeWsConnection(user1Info.userId, "Match found");
    closeWsConnection(user2Info.userId, "Match found");
}

function closeWsConnection(userId: string, reason?: string) {
    const socket = socketClients.get(userId);
    if (socket) {
        if (reason) {
            socket?.emit("disconnect_reason", { reason });
        }
        socket.disconnect();
        socketClients.delete(userId);
    }
}

export { attachWebsocketServer, notifyMatch, closeWsConnection };