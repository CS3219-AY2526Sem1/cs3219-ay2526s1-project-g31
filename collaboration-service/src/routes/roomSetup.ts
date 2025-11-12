import express from 'express';
import * as Y from "yjs";
import { Question, RoomPayload, User } from 'shared';
import { cancelPoll, cancelSessionClosure, joinRoom, requestSessionClosure, sendAiMessage, sendMessage } from '../sockets/socketServer';

/**
 * AI Assistance Disclosure
 * Tool: ChatGPT
 * Scope: See AI-usage-log for details.
 * Author review: See AI-usage-log for details.
 */

const router = express.Router();
const mutex = new Set();
const readyUsers: Record<string, Set<string>> = {};
const rooms: Record<string, RoomPayload> = {};
const docs: Record<string, Y.Doc> = {};

/**
 * Sets the ready status of the current user to be true.
 */
router.post("/me", (req, res) => {
    const { userId, roomId } = req.body;
    console.log(`UserID: ${userId}`);

    if (!readyUsers[roomId]) {
        console.log("Creating new ready set for pair:", roomId);
        readyUsers[roomId] = new Set();
    }
    if (!readyUsers[roomId].has(userId)) {
        console.log(`New UserID: ${userId}`);
        readyUsers[roomId].add(userId);
    }

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
    const roomId = [userId, matchedUserId].sort().join("_");
    const readySet = readyUsers[roomId] || new Set();
    console.log(`Size: ${readySet.size}`);
    const bothReady = readySet.size === 2;
    res.json({ bothReady });
});

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

        const { difficulty, topic } = req.body;

        const questionServiceUrl = process.env.QUESTION_SERVICE_BASE_URL;
        const questionRes = await fetch(`${questionServiceUrl}/api/question/random?difficulty=${difficulty}&topic=${topic}`);
        if (!questionRes.ok) {
            throw new Error("Failed to fetch question");
        }

        const question = await questionRes.json();

        const newRoom: RoomPayload = {
            roomId,
            userIds: [userId, matchedUserId],
            question,
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

router.post("/join/:roomId", (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
    joinRoom(userId, roomId);
    res.status(200).json({ status: "ok" });
})

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

    res.status(200).json({ doc: base64State })
});

router.post("/clear/:roomId", (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    delete rooms[roomId];
    delete docs[roomId];
    delete readyUsers[roomId];
    mutex.delete(roomId);

    const users = roomId.split("_");
    const otherUser = (users[0] === userId) ? users[1] : users[0];
    cancelPoll(userId, otherUser);

    res.status(200).json({ success: true });
});

router.post("/close/:roomId", (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
    requestSessionClosure(roomId, userId);
    res.status(200).json({ success: true });
})

router.post("/cancel/:roomId", (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
    cancelSessionClosure(roomId, userId);
    res.status(200).json({ success: true });
})

router.post("/message/:roomId", (req, res) => {
    const { roomId } = req.params;
    const { senderId, message } = req.body;
    sendMessage(roomId, senderId, message);
    res.status(200).json({ success: true });
})

router.post("/ai-message/:roomId", (req, res) => {
    const { roomId } = req.params;
    const { senderId, message } = req.body;
    sendAiMessage(roomId, senderId, message);
    res.status(200).json({ success: true });
})

export default router;
