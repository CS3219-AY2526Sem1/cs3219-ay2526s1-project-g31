import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import passport from "passport";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import "./strategies/google";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.UI_BASE_URL,
    credentials: true,
}));
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes)

app.get("/", (req, res) => {
    res.send("User Service is running!");
});

export default app;