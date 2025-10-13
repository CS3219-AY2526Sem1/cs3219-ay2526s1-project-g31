// src/sockets/matchSocket.js
import { Server as SocketIOServer } from "socket.io";

const clients = new Map();
let io;
export const setupSocketIO = (server) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*", // change to frontend URL in production
        },
    });

    io.on("connection", (socket) => {
        console.log("[Socket.IO] New client connected:", socket.id);

        socket.on("register", (data) => {
            if (data && typeof data.userId === "string") {
                // If user already exists, disconnect old socket first
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

        socket.on("error", (err) => {
            console.error("[Socket.IO] Socket error:", err);
        });
    });

    return io;
};

const notifiedPairs = new Set();

export function notifyMatch(userA, userB) {
    const key = [userA, userB].sort().join("_");
    if (notifiedPairs.has(key)) return;
    notifiedPairs.add(key);

    const users = [userA, userB];
    users.forEach((u, idx) => {
        const partner = users[1 - idx];
        const socket = clients.get(u);
        if (socket) {
            io.to(socket.id).emit("match", { partner });
            console.log(`[Socket.IO] Sent match notification to ${u}`);
        }
    });
}

