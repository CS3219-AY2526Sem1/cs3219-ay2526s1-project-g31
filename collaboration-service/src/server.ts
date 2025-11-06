import express from "express";
import cors from "cors";
import http from "http";
import roomSetupRouter from "./routes/roomSetup";
import { initializeSocketServer } from "./sockets/socketServer";

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.UI_BASE_URL,
    credentials: true,
}))

app.use("/api/roomSetup", roomSetupRouter)
app.get("/", (req, res) => res.send("Collaboration Service is running!"));

const server = http.createServer(app);
initializeSocketServer(server);

export default server;
