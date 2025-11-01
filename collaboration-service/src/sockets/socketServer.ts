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

        socket.on("session-closing-request", ({ roomId }) => {
            if (activeClosures.has(roomId)) return;

            let countdown = 60;
            io.to(roomId).emit("session-closing-start", { countdown });

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

        socket.on("session-cancel-closing", ({ roomId }) => {
            const timer = activeClosures.get(roomId);
            if (timer) {
                clearInterval(timer);
                activeClosures.delete(roomId);
                io.to(roomId).emit("session-closing-cancelled");
                console.log(`Room ${roomId} closure cancelled`);
            }
        })

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}
