import { dequeueUser, enqueueUser, getQueueLength, setMatch, getMatch } from "../config/redis";
import { notifyMatch } from "../sockets/matchSocket.js";

const matchingLoops: Record<string, NodeJS.Timeout> = {};
const matchingInProgress: Record<string, boolean> = {};

export function startMatchingLoop(difficulty: string) {
    // prevent duplicate loops
    if (matchingLoops[difficulty]) return;

    console.log(`[MATCHING] Starting loop for difficulty: ${difficulty}`);

    matchingLoops[difficulty] = setInterval(async () => {
        if (matchingInProgress[difficulty]) return; // skip if already processing a match
        matchingInProgress[difficulty] = true;

        try {
            const queueLength = await getQueueLength(difficulty);
            if (queueLength < 2) {
                console.log(`[MATCHING] Not enough users for difficulty: ${difficulty}. Stopping loop.`);
                stopMatchingLoop(difficulty);
                return;
            }

            const userA = await dequeueUser(difficulty);
            const userB = await dequeueUser(difficulty);
            if (!userA || !userB) {
                matchingInProgress[difficulty] = false;
                return;
            }

            const existingMatchA = await getMatch(userA);
            const existingMatchB = await getMatch(userB);
            if (existingMatchA || existingMatchB) {
                console.log(`[MATCHING] Skipping already matched users: ${userA}, ${userB}`);
                matchingInProgress[difficulty] = false;
                return;
            }

            await setMatch(userA, userB);

            console.log(`[MATCHING] Matched ${userA} and ${userB} at difficulty ${difficulty}`);

            // ✅ Only notify once
            notifyMatch(userA, userB);

            // ✅ Stop the loop after a successful match
            stopMatchingLoop(difficulty);
        } catch (err) {
            console.error(`[MATCHING] Error in loop for difficulty ${difficulty}:`, err);
        } finally {
            matchingInProgress[difficulty] = false;
        }
    }, 1000);
}

export function stopMatchingLoop(difficulty: string) {
    if (matchingLoops[difficulty]) {
        clearInterval(matchingLoops[difficulty]);
        delete matchingLoops[difficulty];
        delete matchingInProgress[difficulty];
        console.log(`[MATCHING] Loop stopped for difficulty: ${difficulty}`);
    }
}

export async function enqueueAndStart(userId: string, difficulty: string) {
    const existingMatch = await getMatch(userId);
    if (existingMatch) {
        console.log(`[MATCHING] User ${userId} already in a match. Skipping enqueue.`);
        return;
    }

    await enqueueUser(userId, difficulty);
    startMatchingLoop(difficulty);
}
