import express from "express";
import { connectToMatchingService, stopMatching } from "../config/wsClient";
import { enqueueAndStart } from "../services/matcher";

const router = express.Router();

router.post("/start", async (req, res) => {
    const { userId, difficulty } = req.body;

    if (!userId || !difficulty) {
        return res.status(400).send({ error: "userId and difficulty are required" });
    }

    try {
        await enqueueAndStart(userId, difficulty);
        connectToMatchingService(userId);

        return res.status(200).send({ message: "Matching started", userId, difficulty });
    } catch (err) {
        console.error("[MATCH ROUTE] Error starting matching:", err);
        return res.status(500).send({ error: "Failed to start matching" });
    }
});

router.post("/stop", (req, res) => {
    stopMatching();
    return res.status(200).send({ message: "Matching stopped" });
});

export default router;
