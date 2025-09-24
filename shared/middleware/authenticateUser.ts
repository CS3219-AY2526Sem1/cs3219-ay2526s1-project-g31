import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { USER_SERVICE_BASE_URL } from "../constants/common";
import { parse } from "cookie";

export default async function authenticateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
        if (!cookies['connect.sid']) {
            return res.status(401).json({ error: "No session cookie" });
        }
        const sessionCookie = `connect.sid=${cookies['connect.sid']}`
        const response = await axios.get(`${USER_SERVICE_BASE_URL}/api/auth/me`, {
            headers: {
                cookie: sessionCookie,
            },
            withCredentials: true,
        });
        if (!response.data.authenticated) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        return next();
    } catch (err) {
        return res.status(401).json({ error: err });
    }
}