import { dequeueUser, enqueueUser, getQueueLength, setMatch } from "../config/redis";
import { notifyMatch } from "../sockets/matchSocket";

const matchingLoops: Record<string, NodeJS.Timeout> = {};

/** Start persistent loop for a given difficulty */
export function startMatchingLoop(difficulty: string) {
    if (matchingLoops[difficulty]) return;

    console.log(`[MATCHING] Starting loop for difficulty: ${difficulty}`);

    matchingLoops[difficulty] = setInterval(async () => {
        try {
            const queueLength = await getQueueLength(difficulty);

            if (queueLength < 2) {
                console.log(`[MATCHING] Not enough users for difficulty: ${difficulty}. Stopping loop.`);
                stopMatchingLoop(difficulty);
                return;
            }

            const userA = await dequeueUser(difficulty);
            const userB = await dequeueUser(difficulty);

            if (userA && userB) {
                await setMatch(userA, userB);
                console.log(`[MATCHING] Matched ${userA} and ${userB} at difficulty ${difficulty}`);
                notifyMatch(userA, userB);
            }
        } catch (err) {
            console.error(`[MATCHING] Error in loop for difficulty ${difficulty}:`, err);
        }
    }, 1000);
}

/** Stop matching loop */
export function stopMatchingLoop(difficulty: string) {
    if (matchingLoops[difficulty]) {
        clearInterval(matchingLoops[difficulty]);
        delete matchingLoops[difficulty];
        console.log(`[MATCHING] Loop stopped for difficulty: ${difficulty}`);
    }
}

/** Enqueue user and start loop if not running */
export async function enqueueAndStart(userId: string, difficulty: string) {
    await enqueueUser(userId, difficulty);
    startMatchingLoop(difficulty);
}
