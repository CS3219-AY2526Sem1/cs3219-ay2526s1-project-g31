import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

import app from "./server";

const PORT = process.env.API_GATEWAY_PORT;

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});