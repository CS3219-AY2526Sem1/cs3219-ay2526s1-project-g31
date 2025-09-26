import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const USER_SERVICE_BASE_URL = `http://${process.env.BASE_URL}:${process.env.USER_SERVICE_PORT}`;
export const MATCHING_SERVICE_BASE_URL = `http://${process.env.BASE_URL}:${process.env.MATCHING_SERVICE_PORT}`;
export const QUESTION_SERVICE_BASE_URL = `http://${process.env.BASE_URL}:${process.env.QUESTION_SERVICE_PORT}`;
export const COLLABORATION_SERVICE_BASE_URL = `http://${process.env.BASE_URL}:${process.env.COLLABORATION_SERVICE_PORT}`;
export const UI_BASE_URL = `http://${process.env.BASE_URL}:${process.env.UI_PORT}`;