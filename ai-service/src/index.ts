import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import app from "./server";

// Currently putting in socket as || as the env file is called env.example
const PORT = process.env.AI_SERVICE_PORT || 3005;

app.listen(PORT, () => {
  console.log(`AI Service is running on port ${PORT}`);
});
