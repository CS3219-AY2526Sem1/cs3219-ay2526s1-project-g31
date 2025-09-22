import authRoutes from "./routes/auth";
import express from "express";
import session from "express-session";
import type { Request, Response } from "express";
import passport from "passport";
import "./strategies/google";

const app = express();

app.use(express.json());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("User Service is running!");
});

export default app;