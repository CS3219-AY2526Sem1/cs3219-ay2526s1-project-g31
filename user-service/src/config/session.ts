import session from "express-session";
import { createRedisClient } from "shared";

const ConnectRedis = require("connect-redis");
const RedisStore = ConnectRedis.RedisStore;

const sessionConfig = session({
    store: new RedisStore({
        client: createRedisClient(process.env.REDIS_HOST!, process.env.REDIS_PORT!, process.env.REDIS_PASSWORD!),
        prefix: "peerprep:sess:"
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // Expire after 1 hour
    }
});

export default sessionConfig;