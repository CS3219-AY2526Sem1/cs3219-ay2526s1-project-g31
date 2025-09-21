import express from "express";
import type { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Collaboration Service is running!");
});

export default app;