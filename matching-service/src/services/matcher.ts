import { dequeueUser, getQueueLength, setMatch } from "../config/redis";

const matchingLoops: Record<string, NodeJS.Timeout> = {};

/** Start persistent loop for a given difficulty */
export function startMatchingLoop(difficulty: string, onMatch: (users: string[], difficulty: string) => void) {
    if (matchingLoops[difficulty]) return; // Already running

    matchingLoops[difficulty] = setInterval(async () => {
        const queueLength = await getQueueLength(difficulty);

        if (queueLength >= 2) {
            const userA = await dequeueUser(difficulty);
            const userB = await dequeueUser(difficulty);

            if (userA && userB) {
                await setMatch(userA, userB);
                onMatch([userA, userB], difficulty);
            }
        }
    }, 1000); // Checks every second
}

/** Stop matching loop */
export function stopMatchingLoop(difficulty: string) {
    if (matchingLoops[difficulty]) {
        clearInterval(matchingLoops[difficulty]);
        delete matchingLoops[difficulty];
    }
}
