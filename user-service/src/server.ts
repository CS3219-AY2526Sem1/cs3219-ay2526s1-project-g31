import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import express from "express";
import type { Request, Response } from "express";
import passport from "passport";
import "./strategies/google";
import cookieParser from "cookie-parser";
import corsMiddleware from "./middleware/cors";
import cors from "cors";
import { UI_BASE_URL } from "shared";

const app = express();

app.use(express.json());
app.use(cookieParser()); // Add cookie parser for refresh tokens
// app.use(corsMiddleware);
app.use(cors({
    origin: UI_BASE_URL,
    credentials: true, // Allow cookies to be sent
}));
app.use(passport.initialize());
// Removed passport.session() as we're using JWT now

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes)

app.get("/", (req: Request, res: Response) => {
    res.send("User Service is running!");
});

export default app;