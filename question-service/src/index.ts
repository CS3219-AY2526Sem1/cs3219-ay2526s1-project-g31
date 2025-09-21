import dotenv from "dotenv";
import path from "path";
import app from "./server";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = process.env.QUESTION_SERVICE_PORT;

app.listen(PORT, () => {
    console.log(`Question Service is running on port ${PORT}`);
});