import express from "express";
import http from "http";
import { setupFrontendWebSocket } from "./config/frontendWS";
import matchRouter from "./routes/match";

const app = express();
app.use(express.json());

app.use("/api/match", matchRouter);

app.get("/", (_, res) => res.send("Matching Service is running!"));

const server = http.createServer(app);
setupFrontendWebSocket(server);

const PORT = process.env.MATCHING_SERVICE_PORT || 3001;
server.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`))
      .on("error", (err) => console.error("[SERVER] Failed to start:", err));
