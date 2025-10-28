import express from "express";
import { enqueueUser, dequeueUsers } from "../config/redis";
import { UserMatchInfo } from "../constants/match";
import { notifyMatch } from "../config/websocket";
import { Difficulty, Topic, Language } from "../constants/question";
import { resolveMatchedValue } from "../utils/match";
import { User } from "shared";

const router = express.Router();
const readyUsers: Record<string, Set<User>> = {};

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
    const { user, matchedUser } = req.body;
    const pairKey = [user.id, matchedUser.userId].sort().join("_");

    if (!readyUsers[pairKey]) {
        console.log("Creating new ready set for pair:", pairKey);
        readyUsers[pairKey] = new Set();
    }
    readyUsers[pairKey].add(user);

    res.json({ status: "ok" });
});

router.get("/ready/:userId/:matchedUserId", (req, res) => {
    const { userId, matchedUserId } = req.params;
    const pairKey = [userId, matchedUserId].sort().join("_");
    const readySet = readyUsers[pairKey] || new Set();

    const bothReady = readySet.size === 2;
    res.json({ bothReady });
});

router.get("/getMatchedUserId/:userId", (req, res) => {
    const { userId } = req.params;

    for (const pairKey in readyUsers) {
        const IDs = pairKey.split("_");
        if (IDs.includes(userId)) {
            const matchedUserId = IDs.find(id => id !== userId);
            if (matchedUserId) {
                return res.json({ matchedUserId });
            } else {
                return res.status(404).json({ error: "Matched user ID not found in pair" });
            }
        }
    }

    return res.status(404).json({ error: "No match found for this user" });
});

router.get("/getMatchedUser/:userId", (req, res) => {
    const { userId } = req.params;

    for (const pairKey in readyUsers) {
        const userSet = readyUsers[pairKey];

        const users = Array.from(userSet);

        const currentUser = users.find(u => u.id === userId);
        if (currentUser) {
            const matchedUser = users.find(u => u.id !== userId);
            if (matchedUser) {
                return res.json({ matchedUser });
            } else {
                return res.status(404).json({ error: "Matched user not found in pair" });
            }
        }
    }

    return res.status(404).json({ error: "No match found for this user" });
});

export default router;
