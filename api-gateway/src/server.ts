import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { UI_BASE_URL } from "./constants/common";
import { userRouter } from "./routes/user";
import { matchRouter } from "./routes/match";
import { questionRouter } from "./routes/question";
import { collaborationRouter } from "./routes/collaboration";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: UI_BASE_URL,
    credentials: true,
}));
app.use(userRouter);
app.use(matchRouter);
app.use(questionRouter);
app.use(collaborationRouter);

app.get("/", (req, res) => {
    res.send("API Gateway is running!");
});

export default app;