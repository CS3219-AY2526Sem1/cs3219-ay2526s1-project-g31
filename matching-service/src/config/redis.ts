import Redis from "ioredis";
import { closeWsConnection } from "./websocket";
import { normalise } from "../utils/match";
import { UserMatchInfo, MATCH_TTL } from "../constants/match";
import { allDifficulties, allTopics, allLanguages } from "../constants/question";

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

subscriber.subscribe("__keyevent@0__:expired", (err) => {
    if (err) console.error("Failed to subscribe:", err);
    else console.log("Listening for expired user keys...");
});

subscriber.on("message", async (_, key) => {
    // only handle user ttl keys
    if (!key.startsWith("ttl:")) return;

    // key format: ttl:<userId>
    const [, userId] = key.split(":");
    await cleanupExpired(userId);
    console.log(`Cleaned up expired user: ${userId}`);
});

function getQueueKey(difficulty: string, topic: string, language: string): string {
    return `queue:${normalise(difficulty)}:${normalise(topic)}:${normalise(language)}`;
}

function getCompatibleQueueKeys(difficulty: string, topic: string, language: string): string[] {
    difficulty = normalise(difficulty);
    topic = normalise(topic);
    language = normalise(language);

    const keys = new Set<string>();
    const difficulties = difficulty === 'any' ? [...allDifficulties, 'any'] : [difficulty, 'any'];
    const topics = topic === 'any' ? [...allTopics, 'any'] : [topic, 'any'];
    const languages = language === 'any' ? [...allLanguages, 'any'] : [language, 'any'];

    for (const d of difficulties) {
        for (const t of topics) {
            for (const l of languages) {
                keys.add(`queue:${d}:${t}:${l}`);
            }
        }
    }

    return [...keys];
}

async function cleanupExpired(expireUserId: string) {
    const userInfo = await redis.get(`user:${expireUserId}`);
    if (!userInfo) return; // user not found or already cleaned up

    const { difficulty, topic, language } = JSON.parse(userInfo);
    const queueKey = getQueueKey(difficulty, topic, language);
    const queue = await redis.zrange(queueKey, 0, -1);

    for (const userId of queue) {
        const exists = await redis.exists(`ttl:${userId}`);
        if (exists && userId !== expireUserId) continue; // skip over users whose ttl keys still exist
        await redis.zrem(queueKey, userId);
        await redis.del(`user:${expireUserId}`);
        await redis.del(`ttl:${userId}`);
        closeWsConnection(userId, 4000, "Matchmaking timed out");
        if (userId === expireUserId) break; // stop once we reach user we want to expire
    }
}

async function enqueueUser(userInfo: UserMatchInfo) {
    // queue key format: queue:<difficulty>:<topic>:<language>
    const queueKey = getQueueKey(userInfo.difficulty, userInfo.topic, userInfo.language);
    // user key format: user:<userId>
    const userKey = `user:${userInfo.userId}`;
    // ttl key format: ttl:<userId>
    const ttlKey = `ttl:${userInfo.userId}`;
    const now = Date.now();

    await redis
        .multi()
        .set(ttlKey, 1, "EX", MATCH_TTL)
        .set(userKey, JSON.stringify(userInfo))
        .zadd(queueKey, now, userInfo.userId)
        .exec();
}

async function dequeueUsers(difficulty: string, topic: string, language: string): Promise<[UserMatchInfo, UserMatchInfo][]> {
    // Get all compatible queue keys
    const queues = getCompatibleQueueKeys(difficulty, topic, language);
    const candidates = new Set<string>();
    for (const q of queues) {
        const users = await redis.zrange(q, 0, -1);
        users.forEach(u => candidates.add(u));
    }

    const candidateList = Array.from(candidates);
    if (candidateList.length < 2) {
        return [];
    }

    const pairs: [UserMatchInfo, UserMatchInfo][] = [];
    for (let i = 0; i + 1 < candidateList.length; i += 2) {
        const userId1 = candidateList[i];
        const userId2 = candidateList[i + 1];
        const [userInfo1, userInfo2, userTtl1, userTtl2] = await redis.mget(
            `user:${userId1}`,
            `user:${userId2}`,
            `ttl:${userId1}`,
            `ttl:${userId2}`
        );

        if (!userTtl1 || !userTtl2 || !userInfo1 || !userInfo2) {
            continue;
        }

        const user1 = JSON.parse(userInfo1) as UserMatchInfo;
        const user2 = JSON.parse(userInfo2) as UserMatchInfo;

        await Promise.all([
            redis.zrem(getQueueKey(user1.difficulty, user1.topic, user1.language), user1.userId),
            redis.zrem(getQueueKey(user2.difficulty, user2.topic, user2.language), user2.userId),
            redis.del(`user:${user1.userId}`),
            redis.del(`user:${user2.userId}`),
            redis.del(`ttl:${user1.userId}`),
            redis.del(`ttl:${user2.userId}`)
        ]);

        pairs.push([user1, user2]);
    }

    return pairs;
}

export { enqueueUser, dequeueUsers, cleanupExpired };
