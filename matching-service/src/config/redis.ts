import Redis from "ioredis";
import { wsClients } from "./websocket";

const redis = new Redis({
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD!
});

const subscriber = new Redis({
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD!
});

redis.on("connect", () => {
    console.log("Connected to Redis");
});

subscriber.on("connect", () => {
    console.log("Subscriber connected to Redis");
});

const MATCH_TTL = 60; // 1 minute

interface UserMatchInfo {
    userId: string;
    displayName: string;
    email?: string;
    picture?: string;
    difficulty: string;
    topic: string;
    language: string;
}

/**
 * Scan queue up to and including expired userId to remove any expired users.
 */
async function cleanupExpired(expiredUserId: string) {
    // Get the user info to extract difficulty
    const userInfo = await redis.get(`user:${expiredUserId}`);

    if (!userInfo) return; // user not found or already cleaned up

    const { difficulty } = JSON.parse(userInfo);
    const queueKey = `queue:${difficulty.toLowerCase()}`;
    const users = await redis.zrange(queueKey, 0, -1);

    for (const userId of users) {
        const exists = await redis.exists(`user:${userId}`);
        if (exists && userId !== expiredUserId) continue; // skip over expired users whose keys still exist
        await redis.zrem(queueKey, userId);
        // Close WebSocket connection if exists
        console.log("Closing WebSocket for user:", userId);
        wsClients.get(userId)?.close();
        if (userId === expiredUserId) break; // stop once we reach the expired user
    }

    redis.del(`user:${expiredUserId}`);
}

/**
 * Add a user to the queue and set their TTL.
 */
async function enqueueUser(userInfo: UserMatchInfo) {
    const diffLower = userInfo.difficulty.toLowerCase();
    const queueKey = `queue:${diffLower}`;
    const userKey = `user:${userInfo.userId}`;
    const now = Date.now();

    await redis
        .multi()
        .set(userKey, JSON.stringify(userInfo), "EX", MATCH_TTL) // store full user info as JSON
        .zadd(queueKey, now, userInfo.userId)
        .exec();
}

/**
 * Dequeue a valid pair of users (ignores expired ones).
 * Returns full user info for both matched users.
 */
async function dequeueUsers(difficulty: "EASY" | "MEDIUM" | "HARD"): Promise<[UserMatchInfo | null, UserMatchInfo | null]> {
    const diffLower = difficulty.toLowerCase();
    const queueKey = `queue:${diffLower}`;

    while (true) {
        const candidates = await redis.zrange(queueKey, 0, 1); // oldest two
        if (candidates.length < 2) return [null, null];

        const [userId1, userId2] = candidates;

        const [userInfo1, userInfo2] = await redis.mget(
            `user:${userId1}`,
            `user:${userId2}`
        );

        if (!userInfo1) {
            await redis.zrem(queueKey, userId1);
            continue;
        }

        if (!userInfo2) {
            await redis.zrem(queueKey, userId2);
            continue;
        }

        // both valid - remove from queue and return user info
        await redis.zrem(queueKey, userId1, userId2);
        return [JSON.parse(userInfo1), JSON.parse(userInfo2)];
    }
}

/**
 * Handle Redis key expiration events.
 */
subscriber.subscribe("__keyevent@0__:expired", (err) => {
    if (err) console.error("Failed to subscribe:", err);
    else console.log("Listening for expired user keys...");
});

// TODO: add TTL keys
subscriber.on("message", async (_, key) => {
    // only handle user expiration keys
    if (!key.startsWith("user:")) return;

    // key format: user:<userId>
    const [, userId] = key.split(":");

    // Get user info from the value before it expires (if still available)
    const userInfoStr = await redis.get(key);
    console.log("Expired key:", userInfoStr);

    if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        const queueKey = `queue:${userInfo.difficulty.toLowerCase()}`;
        console.log(`⚠️ Expired user ${userId} (${userInfo.difficulty})`);

        const removed = await redis.zrem(queueKey, userId);
        if (removed) {
            console.log(`🧹 Cleaned ${userId} from ${queueKey}`);
            await cleanupExpired(userId);
        }
    }
});

export { enqueueUser, dequeueUsers, cleanupExpired, redis };
export type { UserMatchInfo };
