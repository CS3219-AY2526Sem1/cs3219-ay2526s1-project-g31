import express from "express";
import cors from "cors";
import roomSetupRouter from "./routes/roomSetup";

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}))

app.use("/api/roomSetup", roomSetupRouter)
app.get("/", (req, res) => res.send("Collaboration Service is running!"));

export default app;
