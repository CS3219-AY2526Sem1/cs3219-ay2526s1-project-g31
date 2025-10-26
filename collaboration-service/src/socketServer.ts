import { Question } from "shared";
import { PublicUser } from "./model/publicUser";
import { RoomPayload } from "./model/room";
import { Server } from "socket.io";

const dummyQuestion: Question = {
    id: "question",
    title: "Dummy Question",
    description: "A dummy question for testing"
};

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

        socket.on("joinRoom", (roomId) => {
            if (!roomId) return;

            console.log(`[Socket.IO] ${socket.id} joining room ${roomId}`);
            socket.join(roomId);

            // Create room if not exists
            if (!rooms[roomId]) {
                rooms[roomId] = {
                    roomId,
                    users: [],
                    question: dummyQuestion,
                    createdAt: Date.now(),
                    lastActiveAt: Date.now(),
                };
            }

            const room = rooms[roomId];
            const userNumber = room.users.length + 1;

            const newUser: PublicUser = {
                id: socket.id,
                displayName: `User${userNumber}`,
                picture: undefined,
            };

            // Add user if room not full
            if (room.users.length < 2) {
                room.users.push(newUser);
                socket.emit("receiveUserData", newUser);
            }

            // If two users joined, send room data to both
            if (room.users.length === 2) {
                console.log(`[Socket.IO] Room ${roomId} is full`);
                io.to(roomId).emit("receiveRoomData", room);
            } else {
                console.log(`[Socket.IO] Waiting for second user in ${roomId}`);
            }
        });

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
