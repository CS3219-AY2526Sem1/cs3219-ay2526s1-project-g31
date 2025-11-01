import { count } from "console";
import { Server } from "socket.io";

/**
 * Server-side of Socket.IO
 * 
 * @param server Server for collaboration service.
 * @returns Socket.IO to use for collaboration service.
 */
export function initializeSocketServer(server: any) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    const activeClosures = new Map();

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        socket.on("join-room", ({ roomId }) => {
            if (!roomId) return;
            socket.join(roomId);
        })

        socket.on("message", ({ roomId, senderId, message }: { roomId: string, senderId: string; message: string }) => {
            io.to(roomId).emit("receive-message", { senderId, message });
        });

        // Handle AI message events
        socket.on("ai-message", async (data: { 
            roomId: string; 
            senderId: string; 
            message: string; 
            type: string; 
            code?: string; 
        }) => {
            const { roomId, senderId, message, type, code } = data;

            if (!roomId) {
                console.warn(`[Socket.IO] Missing roomId for message from ${senderId}`);
                return;
            }

            if (type === "user-prompt") {
                // Broadcast user's prompt to everyone in the room
                io.to(roomId).emit("ai-message", { senderId, message, type });

                try {
                    // Call your AI backend API
                    const res = await fetch("http://localhost:3005/api/ai/default", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            question: message,
                            code: code || "",
                            session_id: senderId,
                        }),
                    });

                    const result = await res.json();
                    const aiResponse = result.response || "No response from AI";

                    // Broadcast AI's response to the same room
                    io.to(roomId).emit("ai-message", {
                        roomId,
                        senderId: "AI",
                        message: aiResponse,
                        type: "ai-response",
                    });

                } catch (error) {
                    console.error("[Socket.IO] AI service error:", error);

                    io.to(roomId).emit("ai-message", {
                        roomId,
                        senderId: "AI",
                        message: "Failed to get response from AI service.",
                        type: "ai-response",
                    });
                }
            }
        });

        socket.on("session-closing-request", ({ roomId, userId }) => {
            if (activeClosures.has(roomId)) return;

            let countdown = 60;
            io.to(roomId).emit("session-closing-start", { countdown, closedBy: userId });

            const interval = setInterval(() => {
                countdown--;
                io.to(roomId).emit("session-countdown-tick", { countdown });

                if (countdown <= 0) {
                    clearInterval(interval);
                    activeClosures.delete(roomId);
                    io.to(roomId).emit("session-ended");
                    console.log(`Room ${roomId} closed`);
                }
            }, 1000);

            activeClosures.set(roomId, interval);
        })

        socket.on("session-cancel-closing", ({ roomId, userId }) => {
            const timer = activeClosures.get(roomId);
            if (timer) {
                clearInterval(timer);
                activeClosures.delete(roomId);
                io.to(roomId).emit("session-closing-cancelled", { closedBy: userId });
                console.log(`Room ${roomId} closure cancelled`);
            }
        })

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}
