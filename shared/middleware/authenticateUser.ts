import axios from "axios";
import { Request, Response, NextFunction } from "express";

// Configure this to point to your user service
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001/api/auth/me";

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
    try {
        // Forward the user's cookies to the user service
        const response = await axios.get(USER_SERVICE_URL, {
            withCredentials: true,
        });

        if (response.data.authenticated) {
            return next();
        } else {
            return res.status(401).json({ error: "Not authenticated" });
        }
    } catch (err) {
        return res.status(401).json({ error: "Not authenticated" });
    }
}