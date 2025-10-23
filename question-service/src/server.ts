import express from "express";
import type { Request, Response } from "express";
import questionRouter from "./routes/question.route";

const app = express();

app.use(express.json());
app.use("/questions", questionRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Question Service is running!");
});

export default app;