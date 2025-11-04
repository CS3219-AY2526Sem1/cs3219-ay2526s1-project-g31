import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";

interface JwtPayload {
    userId: string;
    userRole: string;
}

const socketClients = new Map<string, Socket>();

/**
 * Server-side of Socket.IO
 * 
 * @param server Server for collaboration service.
 * @returns Socket.IO to use for collaboration service.
 */
function initializeSocketServer(server: any) {
    const activeClosures = new Map();

    const io = new Server(server, {
        path: "/socket/collaboration",
        cors: {
            origin: process.env.UI_BASE_URL,
            credentials: true,
        },
    });

    io.use((socket, next) => {
        console.log("reached");
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

    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        socketClients.set(userId, socket);
        console.log(`[Socket.IO] Client connected: ${userId}`);

        socket.on("message", ({ roomId, senderId, message }: { roomId: string, senderId: string; message: string }) => {
            console.log("[Socket.IO] Message called");
            io.to(roomId).emit("receive-message", { senderId, message });
        });

        // Handle AI message events
        socket.on("ai-message", async (data: { 
            roomId: string; 
            senderId: string; 
            question: string; 
            code: string; 
            prompt: string; 
            type:string;
            aiMode?: string;
            numPrompts: number;
        }) => {
            console.log("[Socket.IO] AI message called");
            const { roomId, senderId, question, code, prompt, type, aiMode, numPrompts } = data;

            if (!roomId) {
                console.warn(`[Socket.IO] Missing roomId for message from ${senderId}`);
                return;
            }

            if (type === "user-prompt") {
                // Broadcast user's prompt to everyone in the room
                io.to(roomId).emit("ai-message", { senderId, prompt });

                try {
                    // Call your AI backend API
                    const res = await fetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_BASE_URL}/api/ai/${aiMode}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            question: question,
                            code: code || "",
                            prompt: prompt,
                            session_id: senderId,
                            numPrompts: numPrompts
                        }),
                    });
                    
                    const result = await res.json();
                    const aiResponse = result.response || "No response from AI";

                    // Broadcast AI's response to the same room
                    io.to(roomId).emit("ai-message", {
                        senderId: "AI",
                        prompt: aiResponse
                    });

                } catch (error) {
                    console.error("[Socket.IO] AI service error:", error);

                    io.to(roomId).emit("ai-message", {
                        senderId: "AI",
                        prompt: "Failed to get response from AI service.",
                    });
                }
            }
        });

        socket.on("session-closing-request", ({ roomId, id }: { roomId: string, id: string }) => {
            console.log("[Socket.IO] Session close called");
            const clearAiMem = async () => {
                try {
                    const ids = roomId.split("_");

                    const res = await fetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_BASE_URL}/api/ai/clear`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ids }),
                    });

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    console.log(`[Socket.IO] Session closed, deleted data for users: ${ids.join(", ")}`);

                } catch (err) {
                    console.error("[Socket.IO] Failed to close session:", err);
                }
            }

            if (activeClosures.has(roomId)) return;

            let countdown = 60;
            io.to(roomId).emit("session-closing-start", { countdown, closedBy: id});

            const interval = setInterval(() => {
                countdown--;
                io.to(roomId).emit("session-countdown-tick", { countdown });

                if (countdown <= 0) {
                    clearInterval(interval);
                    activeClosures.delete(roomId);
                    io.to(roomId).emit("session-ended");
                    clearAiMem();
                    console.log(`Room ${roomId} closed`);
                }
            }, 1000);

            activeClosures.set(roomId, interval);
        })

        socket.on("session-cancel-closing", ({ roomId, id }) => {
            const timer = activeClosures.get(roomId);
            if (timer) {
                clearInterval(timer);
                activeClosures.delete(roomId);
                io.to(roomId).emit("session-closing-cancelled", { closedBy: id });
                console.log(`Room ${roomId} closure cancelled`);
            }
        })

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

export { initializeSocketServer, joinRoom, cancelPoll, sendMessage };
