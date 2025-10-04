import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

/**
 * Get a Redis client instance.
 * @param host Redis server host
 * @param port Redis server port
 * @param password Redis server password
 * @returns Redis client instance
 */
export function getRedisClient(host: string, port: string, password: string) {
    if (redisClient) {
        return redisClient;
    }
    redisClient = createClient({
        socket: {
            host,
            port: parseInt(port),
        },
        password,
    });

    redisClient.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis');
    });

    redisClient.connect().catch(console.error);
    return redisClient;
};