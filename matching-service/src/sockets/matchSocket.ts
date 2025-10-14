// src/sockets/matchSocket.ts
import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

const clients: Map<string, Socket> = new Map();
let io: SocketIOServer | null = null;


export const setupSocketIO = (server: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*", // TODO: change to frontend URL in production
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log("[Socket.IO] New client connected:", socket.id);

        socket.on("register", (data: { userId?: string }) => {
            if (data && typeof data.userId === "string") {
                const existingSocket = clients.get(data.userId);
                if (existingSocket && existingSocket.id !== socket.id) {
                    existingSocket.disconnect(true);
                    console.log(`[Socket.IO] Disconnected old socket for user: ${data.userId}`);
                }

                clients.set(data.userId, socket);
                console.log(`[Socket.IO] Registered socket for user: ${data.userId}`);
                console.log(`[Socket.IO] Socket for user: ${socket.id}`);
            } else {
                console.warn("[Socket.IO] Invalid register message:", data);
            }
        });

        socket.on("disconnect", () => {
            for (const [userId, s] of clients.entries()) {
                if (s.id === socket.id) {
                    clients.delete(userId);
                    console.log(`[Socket.IO] Disconnected and removed user: ${userId}`);
                    break;
                }
            }
        });

        socket.on("error", (err: Error) => {
            console.error("[Socket.IO] Socket error:", err);
        });
    });

    return io;
};

const notifiedPairs = new Set<string>();


export function notifyMatch(userA: string, userB: string): void {
    if (!io) {
        console.error("[Socket.IO] notifyMatch called before setupSocketIO");
        return;
    }

    const key = [userA, userB].sort().join("_");
    if (notifiedPairs.has(key)) return;
    notifiedPairs.add(key);

    const users = [userA, userB];
    users.forEach((u, idx) => {
        const partner = users[1 - idx];
        const socket = clients.get(u);
        if (socket) {
            io!.to(socket.id).emit("match", { partner });
            console.log(`[Socket.IO] Sent match notification to ${u}`);
        }
    });
}
