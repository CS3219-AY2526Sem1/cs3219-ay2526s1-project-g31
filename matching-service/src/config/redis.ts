import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
});

const MATCH_TTL = 120; // i.e. 2 minutes

/** Enqueues user by difficulty */
export const enqueueUser = async (userId: string, difficulty: string) => {
    const queueKey = `queue:${difficulty}`;
    await redis.rpush(queueKey, userId);
    await redis.expire(queueKey, MATCH_TTL);
};

/** Dequeues a user by difficulty */
export const dequeueUser = async (difficulty: string) => {
    return await redis.lpop(`queue:${difficulty}`);
};

/** Gets queue length */
export const getQueueLength = async (difficulty: string) => {
    return await redis.llen(`queue:${difficulty}`);
};

/** Stores matched pair temporarily */
export const setMatch = async (userA: string, userB: string) => {
    await redis.set(`match:${userA}`, userB, "EX", MATCH_TTL);
    await redis.set(`match:${userB}`, userA, "EX", MATCH_TTL);
};

/** Retrieves a matched partner */
export const getMatch = async (userId: string) => {
    return await redis.get(`match:${userId}`);
};

/** Removes a match */
export const removeMatch = async (userId: string) => {
    const partner = await getMatch(userId);
    if (partner) {
        await redis.del(`match:${userId}`);
        await redis.del(`match:${partner}`);
    }
};

export default redis;
