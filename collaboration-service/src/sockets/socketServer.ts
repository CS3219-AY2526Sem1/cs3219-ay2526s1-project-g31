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

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        socket.on("message", ({ senderId, message }: { senderId: string; message: string }) => {
            io.emit("receive-message", { senderId, message });
        });

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}
