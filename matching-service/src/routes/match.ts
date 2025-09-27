import express, { Request, Response } from "express";
import { enqueueUser, getQueueLength } from "../config/redis";
import { startMatchingLoop } from "../services/matcher";

const router = express.Router();

router.post("/enqueue", async (req: Request, res: Response) => {
    const { userId, difficulty } = req.body;

    if (!userId || !difficulty) {
        return res.status(400).json({ error: "Missing userId or difficulty" });
    }

    await enqueueUser(userId, difficulty);

    // Start matching loop for this difficulty
    startMatchingLoop(difficulty, (users, diff) => {
        console.log(`Matched users: ${users.join(", ")} with difficulty: ${diff}`);
    });

    const queueLength = await getQueueLength(difficulty);

    return res.json({
        matched: queueLength >= 2,
        queueLength,
        message: "User queued",
        difficulty
    });
});

export default router;
