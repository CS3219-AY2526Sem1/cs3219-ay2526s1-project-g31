import jwt from "jsonwebtoken"
import { Server, Socket } from "socket.io";

interface JwtPayload {
    userId: string;
    userRole: string;
}

const activeClosures = new Map();
const socketClients = new Map<string, Socket>();

/**
 * Server-side of Socket.IO
 * 
 * @param server Server for collaboration service.
 * @returns Socket.IO to use for collaboration service.
 */
function initializeSocketServer(server: any) {
    const io = new Server(server, {
        path: '/socket/collaboration',
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
        console.log(`[Socket.IO] Client connected: ${userId}`);

        socket.on("disconnect", () => {
            socketClients.delete(socket.data.userId);
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });
}

function joinRoom(userId: string, roomId: string) {
    const socket = socketClients.get(userId);
    if (socket) {
        socket.join(roomId);
        console.log(`[Socket.IO] User ${userId} joined room ${roomId}`);
    } else {
        console.log(`[Socket.IO] No socket found for user ${userId}`);
    }
}

function cancelPoll(senderId: string, matchedUserId: string) {
    socketClients.get(senderId)?.emit("cancel-poll", { senderId });
    socketClients.get(matchedUserId)?.emit("cancel-poll", { senderId });
}

function sendMessage(roomId: string, senderId: string, message: string) {
    const users = roomId.split("_");
    socketClients.get(users[0])?.emit("receive-message", { senderId, message });
    socketClients.get(users[1])?.emit("receive-message", { senderId, message });
}

function sendAiMessage(roomId: string, senderId: string, message: string) {
    const users = roomId.split("_");
    socketClients.get(users[0])?.emit("ai-message", { senderId, prompt: message });
    socketClients.get(users[1])?.emit("ai-message", { senderId, prompt: message });
}

function requestSessionClosure(roomId: string, userId: string) {
    console.log("[Socket.IO] Session close called");
    const users = roomId.split("_");
    if (activeClosures.has(roomId)) return;

    let countdown = 60;
    socketClients.get(users[0])?.emit("session-closing-start", { countdown, closedBy: userId});
    socketClients.get(users[1])?.emit("session-closing-start", { countdown, closedBy: userId});

    const interval = setInterval(() => {
        countdown--;
        socketClients.get(users[0])?.emit("session-countdown-tick", { countdown });
        socketClients.get(users[1])?.emit("session-countdown-tick", { countdown });

        if (countdown <= 0) {
            clearInterval(interval);
            activeClosures.delete(roomId);
            socketClients.get(users[0])?.emit("session-ended");
            socketClients.get(users[1])?.emit("session-ended");
            console.log(`Room ${roomId} closed`);
        }
    }, 1000);

    activeClosures.set(roomId, interval);
}

function cancelSessionClosure(roomId: string, senderId: string) {
    const timer = activeClosures.get(roomId);
    if (timer) {
        const users = roomId.split("_");
        clearInterval(timer);
        activeClosures.delete(roomId);
        socketClients.get(users[0])?.emit("session-closing-cancelled", { closedBy: senderId });
        socketClients.get(users[1])?.emit("session-closing-cancelled", { closedBy: senderId });
        console.log(`Room ${roomId} closure cancelled`);
    }
}

export { initializeSocketServer, joinRoom, cancelPoll, sendMessage, sendAiMessage, requestSessionClosure, cancelSessionClosure };
