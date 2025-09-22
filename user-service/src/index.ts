import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

import app from "./server";

const PORT = process.env.USER_SERVICE_PORT;

app.listen(PORT, () => {
    console.log(`User Service is running on port ${PORT}`);
});

/**
 * TODO:
 * - login ui, test protected routes
 * - user storage on mongodb + user schema
 * - redis session store (optional)
 */