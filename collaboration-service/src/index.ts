import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import app from "./server";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = process.env.COLLABORATION_SERVICE_PORT;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`[Socket.IO] ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
    console.log(`Collaboration Service is running on port ${PORT}`);
});