import { createClient } from "redis";

const createRedisClient = (host: string, port: string, password: string) => {
    const client = createClient({
        socket: {
            host,
            port: parseInt(port),
        },
        password,
    });

    client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
        console.log('Connected to Redis');
    });

    client.connect().catch(console.error);
    return client;
}

export { createRedisClient };