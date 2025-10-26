import express from "express";
import { enqueueUser, dequeueUsers } from "../config/redis";
import { UserMatchInfo } from "../constants/match";
import { notifyMatch } from "../config/websocket";
import { Difficulty, Topic, Language } from "../constants/question";
import { resolveMatchedValue } from "../utils/match";

const router = express.Router();
const readyUsers: Record<string, Set<string>> = {};

router.post("/start", async (req, res) => {
    const { userId, displayName, email, picture, difficulty, topic, language } = req.body;
    try {
        (async () => {
            const userInfo: UserMatchInfo = {
                userId,
                displayName,
                email,
                picture,
                difficulty,
                topic,
                language
            };

            await enqueueUser(userInfo);
            const pairs = await dequeueUsers(difficulty, topic, language);
            for (const [user1Info, user2Info] of pairs) {
                const matchedDifficulty = resolveMatchedValue(user1Info.difficulty, user2Info.difficulty, Difficulty);
                const matchedTopic = resolveMatchedValue(user1Info.topic, user2Info.topic, Topic);
                const matchedLanguage = resolveMatchedValue(user1Info.language, user2Info.language, Language);
                notifyMatch(user1Info, user2Info, matchedDifficulty, matchedTopic, matchedLanguage);
            }
        })();
        return res.status(200).send({ message: "Matching started" });
    } catch (err) {
        console.error("Error starting matching:", err);
        return res.status(500).send({ error: "Failed to start matching" });
    }
});

router.post("/ready", (req, res) => {
    const { userId, matchedUserId } = req.body;
    const pairKey = [userId, matchedUserId].sort().join("_");

    if (!readyUsers[pairKey]) readyUsers[pairKey] = new Set();
    readyUsers[pairKey].add(userId);

    res.json({ status: "ok" });
});

router.get("/ready/:userId/:matchedUserId", (req, res) => {
    const { userId, matchedUserId } = req.params;
    const pairKey = [userId, matchedUserId].sort().join("_");
    const readySet = readyUsers[pairKey] || new Set();

    const bothReady = readySet.size === 2;
    res.json({ bothReady });
});

router.post("/cancelReady", (req, res) => {
    const { userId, matchedUserId } = req.body;
    const pairKey = [userId, matchedUserId].sort().join("_");
    
    if (readyUsers[pairKey]) {
        delete readyUsers[pairKey];
    }

    res.json({ status: "ok" });
});

export default router;
