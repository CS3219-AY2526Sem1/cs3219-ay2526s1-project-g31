"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const server_1 = __importDefault(require("./server"));
// Currently putting in socket as || as the env file is called env.example
const PORT = process.env.AI_SERVICE_PORT || 3005;
server_1.default.listen(PORT, () => {
    console.log(`AI Service is running on port ${PORT}`);
});
