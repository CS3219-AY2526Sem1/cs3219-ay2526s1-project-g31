import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import questionRouter from "./routes/question.route";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
// standardise with other services
app.use("/api/question", questionRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Question Service is running!");
});

export default app;