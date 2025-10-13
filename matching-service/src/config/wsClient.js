// src/config/wsClient.js
const { io } = require("socket.io-client");
const { notifyMatch } = require("../sockets/matchSocket");

let socket = null;
let userId = null;
let reconnectInterval = null;
const RECONNECT_DELAY = 2000;

let userData = null; // properly declared

// ===== Frontend clients broadcasting =====
const frontendClients = new Set();

/**
 * Register a frontend client socket
 * @param {Socket} clientSocket
 */
function registerFrontendClient(clientSocket) {
    frontendClients.add(clientSocket);
    clientSocket.on("disconnect", () => frontendClients.delete(clientSocket));
}

// ===== Connect to matching service =====
function connectToMatchingService(uid) {
    userId = uid;

    return new Promise((resolve, reject) => {
        const connect = () => {
            socket = io("http://localhost:3002", {
                reconnection: false, // handle manually
            });

            socket.on("connect", () => {
                console.log("[SOCKET CLIENT] Connected to matching service");

                userData = { userId, socketId: socket.id };
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

            socket.on("connect_error", (err) => {
                console.error("[SOCKET CLIENT] Connection error:", err);
                socket.disconnect();
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

/**
 * Stops matching and disconnects socket
 */
function stopMatching() {
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

module.exports = {
    connectToMatchingService,
    stopMatching,
    registerFrontendClient,
};
