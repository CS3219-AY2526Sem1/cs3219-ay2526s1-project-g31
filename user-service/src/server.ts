import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import express from "express";
import type { Request, Response } from "express";
import passport from "passport";
import "./strategies/google";
import sessionConfig from "./config/session";
import corsMiddleware from "./middleware/cors";

const app = express();

app.use(express.json());
app.use(sessionConfig);
app.use(corsMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes)

app.get("/", (req: Request, res: Response) => {
    res.send("User Service is running!");
});

export default app;