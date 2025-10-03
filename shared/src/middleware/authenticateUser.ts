import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { USER_SERVICE_BASE_URL } from "../constants/common";

// Extend Request interface for user data
declare global {
    namespace Express {
        interface Request {
            user?: any; // Flexible type for user data from JWT
        }
    }
}

export default async function authenticateUser(req: Request, res: Response, next: NextFunction) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "No access token provided" });
        }

        // Forward the authorization header to the user service for validation
        const response = await axios.get(`${USER_SERVICE_BASE_URL}/api/auth/verify`, {
            headers: {
                authorization: authHeader,
            },
        });

        if (!response.data.authenticated) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        // Attach user info to request if needed
        req.user = response.data.user;
        return next();
    } catch (err: any) {
        if (err.response && err.response.status === 401) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        return res.status(401).json({ error: "Authentication failed" });
    }
}