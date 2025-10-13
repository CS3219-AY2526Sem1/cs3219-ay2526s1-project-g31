// frontendSocket.js
const { Server } = require("socket.io");
const { registerFrontendClient } = require("./wsClient");

function setupFrontendSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // change this to your frontend URL in production
        },
    });

    io.on("connection", (socket) => {
        console.log("[SOCKET.IO SERVER] Frontend connected:", socket.id);
        registerFrontendClient(socket);
        console.log(`[SOCKET.IO SERVER] Total clients: ${io.sockets.sockets.size}`);
    });

    return io;
}

module.exports = { setupFrontendSocket };
