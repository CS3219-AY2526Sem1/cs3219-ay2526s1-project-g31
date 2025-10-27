import { Question } from "shared";
import { PublicUser } from "./model/publicUser";
import { RoomPayload } from "./model/room";
import { Server } from "socket.io";

export function initializeSocketServer(server: any) {
    // Store which users are in which room
    const rooms: Record<string, RoomPayload> = {};

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);

            // Clean up user from room
            for (const [roomId, room] of Object.entries(rooms)) {
                const before = room.users.length;
                room.users = room.users.filter(u => u.id !== socket.id);
                if (room.users.length < before) {
                    console.log(`[Socket.IO] Removed ${socket.id} from room ${roomId}`);
                }
            }
        })
    });

    return io;
}
