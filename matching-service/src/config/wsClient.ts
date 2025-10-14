// src/config/wsClient.ts
import { io, Socket } from "socket.io-client";
import { notifyMatch } from "../sockets/matchSocket";

let socket: Socket | null = null;
let userId: string | null = null;
let reconnectInterval: NodeJS.Timeout | null = null;
const RECONNECT_DELAY = 2000;

interface UserData {
    userId: string;
    socketId: string;
}

let userData: UserData | null = null;

const frontendClients = new Set<Socket>();

export function registerFrontendClient(clientSocket: Socket): void {
    frontendClients.add(clientSocket);
    clientSocket.on("disconnect", () => frontendClients.delete(clientSocket));
}

export function connectToMatchingService(uid: string): Promise<UserData> {
    userId = uid;

    return new Promise((resolve, reject) => {
        const connect = () => {
            socket = io("http://localhost:3002", {
                reconnection: false, // handle manually
            });

            socket.on("connect", () => {
                console.log("[SOCKET CLIENT] Connected to matching service");

                // Type-safe check: ensure socket.id exists
                if (!socket?.id) {
                    reject(new Error("Socket ID is undefined"));
                    return;
                }

                // Assign userData after confirming socket.id
                userData = { userId: uid, socketId: socket.id };
                socket.emit("register", userData);

                if (reconnectInterval) {
                    clearInterval(reconnectInterval);
                    reconnectInterval = null;
                }

                resolve(userData);
            });

            socket.on("disconnect", () => {
                console.log("[SOCKET CLIENT] Disconnected");
                attemptReconnect();
            });

            socket.on("connect_error", (err: Error) => {
                console.error("[SOCKET CLIENT] Connection error:", err);
                socket?.disconnect();
                reject(err);
            });
        };

        const attemptReconnect = () => {
            if (!reconnectInterval) {
                console.log(`[SOCKET CLIENT] Attempting reconnect in ${RECONNECT_DELAY}ms...`);
                reconnectInterval = setInterval(() => {
                    console.log("[SOCKET CLIENT] Reconnecting...");
                    connect();
                }, RECONNECT_DELAY);
            }
        };

        connect();
    });
}

export function stopMatching(): void {
    if (socket && userId) {
        socket.emit("unregister", { userId });
        socket.disconnect();
    }

    socket = null;
    userId = null;

    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
}
