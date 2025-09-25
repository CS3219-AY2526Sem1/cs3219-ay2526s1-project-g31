import session from "express-session";
import redisClient from "./redis";

const ConnectRedis = require("connect-redis");
const RedisStore = ConnectRedis.RedisStore;

const sessionConfig = session({
    store: new RedisStore({
        client: redisClient,
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