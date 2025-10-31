import express from 'express';
import * as Y from "yjs";
import { Question, User } from 'shared';
import { PublicUser } from 'src/model/publicUser';
import { RoomPayload } from 'src/model/room';

const router = express.Router();
const mutex = new Set();
const readyUsers: Record<string, Set<User>> = {};
const rooms: Record<string, RoomPayload> = {};
const docs: Record<string, Y.Doc> = {};

/**
 * Joins both users to a shared collaboration session.
 * 
 * @param userId ID of the current user.
 * @param matchedUserId ID of the user the current user is matched with.
 */
router.post("/room/:userId/:matchedUserId", async (req, res) => {
    const { userId, matchedUserId } = req.params;

    if (!userId || !matchedUserId) {
        return res.status(400).json({ error: "Both user IDs are required" });
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

        const dummyQuestion: Question = {
            id: "question",
            title: "Dummy Question",
            description: "A dummy question for testing"
        };

        const newRoom: RoomPayload = {
            roomId,
            userIds: [userId, matchedUserId],
            question: dummyQuestion,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
        }

        rooms[roomId] = newRoom;
        docs[roomId] = new Y.Doc();

        res.status(201).json({ newRoom });
    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).json({ error: "Failed to create room" });
    } finally {
        mutex.delete(roomId);
    }
});

/**
 * Sets the ready status of the current user to be true.
 */
router.post("/me", (req, res) => {
    const { user, matchedUser } = req.body;
    const pairKey = [user.id, matchedUser.userId].sort().join("_");

    if (!readyUsers[pairKey]) {
        console.log("Creating new ready set for pair:", pairKey);
        readyUsers[pairKey] = new Set();
    }
    readyUsers[pairKey].add(user);

    res.json({ status: "ok" });
});

/**
 * Returns whether both users have joined the collaboration room.
 * 
 * @param userId ID of the current user.
 * @param matchedUserId ID of the user the current user is matched with.
 */
router.get("/users/:userId/:matchedUserId", (req, res) => {
    const { userId, matchedUserId } = req.params;
    const pairKey = [userId, matchedUserId].sort().join("_");
    const readySet = readyUsers[pairKey] || new Set();
    const bothReady = readySet.size === 2;
    res.json({ bothReady });
});

/**
 * Retrieves the common Yjs document between the two users.
 * 
 * @param roomId to distinguish Yjs documents by the room they are for.
 */
router.get("/codespace/:roomId", (req, res) => {
    const { roomId } = req.params;
    const doc = docs[roomId];

    if (!doc) return res.status(404).json({ error: "Room not found" });

    const state = Y.encodeStateAsUpdate(doc);
    const base64State = Buffer.from(state).toString("base64");

    res.json({ doc: base64State })
});

export default router;
