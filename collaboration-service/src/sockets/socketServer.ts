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
            question: string; 
            code: string; 
            prompt: string; 
            type:string;
            aiMode?: string;
            numPrompts: number;
        }) => {
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
                    const res = await fetch(`http://localhost:3005/api/ai/${aiMode}`, {
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

        socket.on("session-closing-request", ({ roomId, userId }: { roomId: string, userId: string }) => {
            const clearAiMem = async () => {
                try {
                    const ids = roomId.split("_");

                    const res = await fetch("http://localhost:3005/api/ai/clear", {
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
            io.to(roomId).emit("session-closing-start", { countdown, closedBy: userId });

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

        socket.on("session-cancel-closing", ({ roomId, userId }) => {
            const timer = activeClosures.get(roomId);
            if (timer) {
                clearInterval(timer);
                activeClosures.delete(roomId);
                io.to(roomId).emit("session-closing-cancelled", { closedBy: userId });
                console.log(`Room ${roomId} closure cancelled`);
            }
        })

        socket.on("cancel-poll", ({ roomId, senderId }) => {
            console.log("received")
            socket.join(roomId);
            io.to(roomId).emit("cancel-poll", { senderId });
        })

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}
