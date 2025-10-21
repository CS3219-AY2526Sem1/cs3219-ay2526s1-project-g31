import express from "express";
import cors from "cors";
import http from "http";
import { attachWebsocketServer } from "./config/websocket";
import matchRouter from "./routes/match";
import { wsClients } from "./config/websocket";
import { redis } from "./config/redis";

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000", // TODO: use env
    credentials: true,
}));

app.use("/api/match", matchRouter);
app.get("/", (req, res) => res.send("Matching Service is running! Clients: " + wsClients.size + " Redis: " + redis.status));

const server = http.createServer(app);
attachWebsocketServer(server);

export default server;

/**
 * Redis queue
 * - easy, medium, hard queue
 * 
 * start route
 * 1. User choose easy and clicks start match
 * 2. Create ws connection (use bearer token to identify userId) then add userId to easy queue in redis via http
 * 3. Call startMatch(difficulty=easy) to match 2 users on easy queue, remove both from queue
 * 4. If match found, send matched partner info via ws then close ws after successful send
 * 5. If no match found, keep user in queue for TTL (2 mins)
 * 
 * stop route
 * 1. User clicks stop match
 * 2. Remove user from queue, close ws
 * 
 * redis ttl event
 * - TTL expires, remove user from queue and close ws
 * 
 * Edge cases
 * - User disconnects ws (close tab/browser) without clicking stop
 *   - Handle ws onclose event to remove user from queue
 * - User tries to start match when already in queue
 *   - check if userId already in wsClients map on ws connection, if yes reject connection
 * 
 * ws
 * - on connect, register userId with ws connection
 * - on close, remove user from queue if in queue
 * - send match found message to user (ws.send)
 * 
 * client ws
 * message: receive match found message on client
 * 
 * TODO:
 * - TTL expiry(create a ttl key that expires, use key to clear persistent user info and queue)
*/
