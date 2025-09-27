import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

/** Enqueues user by difficulty */
export const enqueueUser = async (userId: string, difficulty: string) => {
    await redis.rpush(`queue:${difficulty}`, userId);
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
    await redis.set(`match:${userA}`, userB);
    await redis.set(`match:${userB}`, userA);
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
