const express = require("express");
const { connectToMatchingService, stopMatching } = require("../config/wsClient");
const { enqueueAndStart } = require("../services/matcher");

const router = express.Router();

router.post("/start", async (req, res) => {
    const { userId, difficulty, topic, language } = req.body;

    if (!userId || !difficulty || !topic || !language) {
        return res.status(400).send({ error: "userId, difficulty, topic and language are required" });
    }

    try {
        const userData = await connectToMatchingService(userId);
        const criterias = difficulty + "_" + topic + "_" + language;
        await enqueueAndStart(userData.userId, criterias);

        return res.status(200).send({ message: "Matching started", userData, criterias });
    } catch (err) {
        console.error("[MATCH ROUTE] Error starting matching:", err);
        return res.status(500).send({ error: "Failed to start matching" });
    }
});

router.post("/stop", (req, res) => {
    stopMatching();
    return res.status(200).send({ message: "Matching stopped" });
});

module.exports = router;
