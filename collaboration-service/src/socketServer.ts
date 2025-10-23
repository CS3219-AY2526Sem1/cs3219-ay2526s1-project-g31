import { Question } from "shared";
import { PublicUser } from "./model/publicUser";
import { RoomPayload } from "./model/room";
import { Server } from "socket.io";

const dummyUserA: PublicUser = {
    id: "A",
    displayName: "UserA",
    picture: undefined 
};

const dummyUserB: PublicUser = {
    id: "B",
    displayName: "UserB",
    picture: undefined 
};

const dummyQuestion: Question = {
    id: "question",
    title: "Dummy Question",
    description: "A dummy question"
};

const dummyRoom: RoomPayload = {
    roomId: "dummy-room",
    users: [ dummyUserA, dummyUserB ],
    question: dummyQuestion,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
};

export function initializeSocketServer(server: any) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        socket.on("joinDummyRoom", () => {
            socket.join(dummyRoom.roomId);
            console.log(`[Socket.IO] Client connected: ${socket.id}`);
            socket.emit("roomData", dummyRoom);
        });

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        })
    });

    return io;
}
