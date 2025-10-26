import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import http from "http";
import app from "./server";
import { initializeSocketServer } from "./socketServer";


const PORT = process.env.COLLABORATION_SERVICE_PORT || 3004;
const server = http.createServer(app);

initializeSocketServer(server);

server.listen(PORT, () => {
    console.log(`Collaboration Service is running on port ${PORT}`);
});
