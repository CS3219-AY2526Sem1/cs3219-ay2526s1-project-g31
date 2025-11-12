import express from "express";
import { enqueueUser, dequeueUsers } from "../config/redis";
import { UserMatchInfo } from "../constants/match";
import { notifyMatch } from "../config/websocket";
import { Difficulty, Topic, Language } from "../constants/question";
import { resolveMatchedValue } from "../utils/match";

/**
 * AI Assistance Disclosure
 * Tool: Microsoft Copilot
 * Scope: Generated initial start route implementation.
 * Author review: Validated correctness.
 */

const router = express.Router();

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

export default router;
