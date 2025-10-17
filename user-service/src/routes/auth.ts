import jwt from "jsonwebtoken";
import passport from "passport";
import { Router } from "express";
import { User } from "@prisma/client";
import { generateAccessToken, generateRefreshToken, RefreshTokenPayload } from '../utils/jwt';
import { createRefreshToken, deleteRefreshToken, validateRefreshToken } from '../utils/refreshToken';
import { JWT_REFRESH_EXPIRES_DAYS } from "../utils/jwt";
import { UI_BASE_URL } from "../constants/common";
import { prisma } from "../db/prisma";

const router = Router();

// Redirect to google for authentication
router.get('/google', passport.authenticate('google'));

// Handle callback from google
router.get('/google/callback', async (req, res) => {
    // Use passport authenticate without session
    passport.authenticate('google', { session: false }, async (err, user: User) => {
        if (err) {
            console.error('OAuth error:', err);
            return res.redirect(`${UI_BASE_URL}/auth/login`);
        }

        if (!user) {
            console.error('No user returned from OAuth');
            return res.redirect(`${UI_BASE_URL}/auth/login`);
        }

        try {
            // Create new refresh token in db
            const tokenId = await createRefreshToken(user.id);
            const refreshToken = generateRefreshToken(user.id, tokenId);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000 // days in milliseconds
            });

            res.redirect(UI_BASE_URL);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${UI_BASE_URL}/auth/login`);
        }
    })(req, res);
});

router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token not provided' });
        }

        const { tokenId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as RefreshTokenPayload;
        const userId = await validateRefreshToken(tokenId);
        if (!userId) {
            return res.status(401).json({ error: 'Invalid or expired refresh token.' });
        }

        const { role } = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { role: true }
        });

        const accessToken = generateAccessToken(userId, role);

        res.json({
            accessToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Token refresh error' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ error: 'No refresh token.' });
        }

        const { tokenId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as RefreshTokenPayload;
        await deleteRefreshToken(tokenId);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Could not log out' });
    }
});

export default router;