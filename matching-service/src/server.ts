import express from "express";
import cors from "cors";
import http from "http";
import { attachWebsocketServer } from "./config/websocket";
import matchRouter from "./routes/match";
import { UI_BASE_URL } from "./constants/common";

const app = express();
app.use(express.json());
app.use(cors({
    origin: UI_BASE_URL,
    credentials: true,
}));

app.use("/api/match", matchRouter);
app.get("/", (req, res) => res.send("Matching Service is running!"));

const server = http.createServer(app);
attachWebsocketServer(server);

export default server;