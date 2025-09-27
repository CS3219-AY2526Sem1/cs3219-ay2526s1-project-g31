import "dotenv/config";  // loads .env variables automatically
import "./server";       // starts server with WebSocket

console.log(`[INDEX] Matching Service started on port ${process.env.MATCHING_SERVICE_PORT || 3001}`);
