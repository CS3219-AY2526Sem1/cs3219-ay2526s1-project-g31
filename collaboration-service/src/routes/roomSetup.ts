import express from 'express';
import { Question } from 'shared';
import { PublicUser } from 'src/model/publicUser';
import { RoomPayload } from 'src/model/room';

const router = express.Router();
const mutex = new Set();
const rooms: Record<string, RoomPayload> = {};

router.post("/createRoom/:userId/:matchedUserId", async (req, res) => {
    const { userId, matchedUserId } = req.params;
    const { userDisplayName, matchedUserDisplayName } = req.body;

    if (!userId || !matchedUserId) {
        return res.status(400).json({ error: "Both user IDs are required" });
    }

    var userName = userDisplayName;
    var matchedUserName = matchedUserDisplayName;

    if (!userDisplayName) {
        console.log("User display name is missing");
        userName = "UserA";
    }

    if (!matchedUserDisplayName) {
        console.log("Matched user display name is missing");
        matchedUserName = "UserB";
    }

    const roomId = [userId, matchedUserId].sort().join("_");

    if (mutex.has(roomId)) {
        return res.status(429).json({ error: "Room creation in progress" });
    }

    mutex.add(roomId);
    
    try {
        if (rooms[roomId]) {
            return res.status(200).json({ newRoom: rooms[roomId] });
        }

        const userA: PublicUser = {
            id: userId,
            displayName: userName,
            picture: undefined,
        }

        const userB: PublicUser = {
            id: matchedUserId,
            displayName: matchedUserName,
            picture: undefined,
        }

        const dummyQuestion: Question = {
            id: "question",
            title: "Dummy Question",
            description: "A dummy question for testing"
        };

        const newRoom: RoomPayload = {
            roomId,
            users: [userA, userB],
            question: dummyQuestion,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
        }

        rooms[roomId] = newRoom;

        res.status(201).json({ newRoom });
    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).json({ error: "Failed to create room" });
    } finally {
        mutex.delete(roomId);
    }
});

export default router;
