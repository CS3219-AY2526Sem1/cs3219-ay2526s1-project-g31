// frontendSocket.ts
import { Server } from "socket.io";
import { registerFrontendClient } from "./wsClient";

function setupFrontendSocket(server: any) {
    const io = new Server(server, {
        cors: {
            origin: "*", // change this to your frontend URL in production
        },
    });

    io.on("connection", (socket) => {
        console.log("[SOCKET.IO SERVER] Frontend connected:", socket.id);
        registerFrontendClient(socket as any);
        console.log(`[SOCKET.IO SERVER] Total clients: ${io.sockets.sockets.size}`);
    });

    return io;
}

export { setupFrontendSocket };
