// src/routes/matchRoute.ts
import express, { Request, Response } from "express";
import { connectToMatchingService, stopMatching } from "../config/wsClient";
import { enqueueAndStart } from "../services/matcher";

const router = express.Router();

router.post("/start", async (req: Request, res: Response) => {
    const { userId, difficulty, topic, language } = req.body as {
        userId?: string;
        difficulty?: string;
        topic?: string;
        language?: string;
    };

    if (!userId || !difficulty || !topic || !language) {
        return res.status(400).send({
            error: "userId, difficulty, topic, and language are required",
        });
    }

    try {
        const userData = await connectToMatchingService(userId);
        const criterias = `${difficulty}_${topic}_${language}`;
        await enqueueAndStart(userData.userId, criterias);

        return res.status(200).send({
            message: "Matching started",
            userData,
            criterias,
        });
    } catch (err) {
        console.error("[MATCH ROUTE] Error starting matching:", err);
        return res.status(500).send({ error: "Failed to start matching" });
    }
});

router.post("/stop", (_req: Request, res: Response) => {
    stopMatching();
    return res.status(200).send({ message: "Matching stopped" });
});

export default router;
