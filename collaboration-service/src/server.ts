import express from "express";
import type { Request, Response } from "express";
import { RoomPayload } from "./model/room";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Collaboration Service is running!");
});

app.post("/api/room/create", (req: Request, res: Response) => {
    const payload = req.body as RoomPayload;
    console.log("Room created:", payload.roomId, payload.users);
    res.status(200).send("Room initialized");
});

export default app;
