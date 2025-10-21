import express from "express";
import { enqueueUser, dequeueUsers, UserMatchInfo } from "../config/redis";
import { wsClients } from "../config/websocket";

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
            const [user1Info, user2Info] = await dequeueUsers(difficulty);

            if (user1Info && user2Info) {
                console.log(`Matched ${user1Info.userId} and ${user2Info.userId} at difficulty ${difficulty}`);

                // Send match info to user1
                wsClients.get(user1Info.userId)?.send(JSON.stringify({
                    type: "match_found",
                    userId: user2Info.userId,
                    displayName: user2Info.displayName,
                    email: user2Info.email,
                    picture: user2Info.picture,
                    difficulty: user2Info.difficulty,
                    topic: user1Info.topic,
                    language: user1Info.language,
                }));

                // Send match info to user2
                wsClients.get(user2Info.userId)?.send(JSON.stringify({
                    type: "match_found",
                    userId: user1Info.userId,
                    displayName: user1Info.displayName,
                    email: user1Info.email,
                    picture: user1Info.picture,
                    difficulty: user1Info.difficulty,
                    // override user2's topic and language with user1's
                    topic: user1Info.topic,
                    language: user1Info.language,
                }));
                wsClients.get(user1Info.userId)?.close();
                wsClients.get(user2Info.userId)?.close();
            }
        })();
        return res.status(200).send({ message: "Matching started" });
    } catch (err) {
        console.error("Error starting matching:", err);
        return res.status(500).send({ error: "Failed to start matching" });
    }
});

export default router;
