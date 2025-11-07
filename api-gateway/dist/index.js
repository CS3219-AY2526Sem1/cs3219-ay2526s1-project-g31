"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env"), override: true });
const server_1 = __importDefault(require("./server"));
const PORT = process.env.API_GATEWAY_PORT;
server_1.default.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
