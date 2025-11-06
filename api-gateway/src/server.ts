import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user";
import { matchRouter } from "./routes/match";
import { questionRouter } from "./routes/question";
import { collaborationRouter } from "./routes/collaboration";
import { aiRouter } from "./routes/ai";
import { wsProxy } from "./middleware/proxy";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.UI_BASE_URL,
    credentials: true,
}));
app.use(userRouter);
app.use(matchRouter);
app.use(questionRouter);
app.use(collaborationRouter);
app.use(aiRouter);

export const wsMatchingProxy = wsProxy(process.env.MATCHING_SERVICE_BASE_URL!, '/socket/matching');
export const wsCollaborationProxy = wsProxy(process.env.COLLABORATION_SERVICE_BASE_URL!, '/socket/collaboration');
app.use(wsMatchingProxy);
app.use(wsCollaborationProxy);

app.get("/", (req, res) => {
    res.send("API Gateway is running!");
});

export default app;