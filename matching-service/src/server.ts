import express from "express";
import cors from "cors";
import http from "http";
import { setupFrontendWebSocket } from "./config/frontendWS";
import matchRouter from "./routes/match";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // your frontend origin
  credentials: true,
}));

app.use("/api/match", matchRouter);

app.get("/", (_, res) => res.send("Matching Service is running!"));

const server = http.createServer(app);
setupFrontendWebSocket(server);

const PORT = process.env.MATCHING_SERVICE_PORT || 3002;
server.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`))
      .on("error", (err) => console.error("[SERVER] Failed to start:", err));
