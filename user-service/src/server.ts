import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import express from "express";
import session from "express-session";
import type { Request, Response } from "express";
import passport from "passport";
import "./strategies/google";
import { UI_BASE_URL } from "../../shared/constants/common";

const app = express();

app.use(express.json());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', UI_BASE_URL);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes)

app.get("/", (req: Request, res: Response) => {
    res.send("User Service is running!");
});

export default app;