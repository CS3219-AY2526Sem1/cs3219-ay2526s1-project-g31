import express from "express";
import cors from "cors";
import http from "http";
import { UI_BASE_URL } from "./constants/common";
import aiRouter from "./routes/aiRoute";

const app = express();
app.use(express.json());
app.use(cors({
    origin: UI_BASE_URL,
    credentials: true,
}));

// same as the rest of the services
app.use("/api/ai", aiRouter);
app.get("/", (req, res) => res.send("AI Service is running!"));

const server = http.createServer(app);

export default server;