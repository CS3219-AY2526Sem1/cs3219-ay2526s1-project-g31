import express from 'express';
import { Question, User } from 'shared';
import { PublicUser } from 'src/model/publicUser';
import { RoomPayload } from 'src/model/room';

const router = express.Router();
const mutex = new Set();
const readyUsers: Record<string, Set<User>> = {};
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
