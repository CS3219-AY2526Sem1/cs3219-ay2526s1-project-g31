import jwt from "jsonwebtoken";
import passport from "passport";
import { Router } from "express";
import { User, UI_BASE_URL } from 'shared';
import { generateTokens, RefreshTokenPayload } from '../utils/jwt';
import { createRefreshToken, deleteRefreshToken, validateRefreshToken } from '../utils/refreshToken';

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
            // Convert to shared User interface
            // const userForToken: User = {
            //     id: user.id,
            //     google_id: user.google_id,
            //     email: user.email || undefined,
            //     displayName: user.displayName || undefined,
            //     firstName: user.firstName || undefined,
            //     lastName: user.lastName || undefined,
            //     picture: user.picture || undefined,
            //     lastLogin: user.lastLogin || undefined,
            //     createdAt: user.createdAt,
            //     lastUpdated: user.lastUpdated
            // };

            // Create refresh token in database
            const tokenId = await createRefreshToken(user.id);

            // Generate JWT tokens (only userId in payload)
            const { refreshToken } = generateTokens(user.id, tokenId);
            // Set refresh token as httpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.redirect(UI_BASE_URL);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${UI_BASE_URL}/auth/login`);
        }
    })(req, res);
});

// Check if user is authenticated (JWT-based)
// router.get('/me', authenticateJWT, async (req, res) => {
//     try {
//         const jwtUser = req.jwtUser!;

//         // Fetch user data from database
//         const user = await prisma.user.findUnique({
//             where: { id: jwtUser.userId }
//         });

//         if (!user) {
//             return res.status(404).json({
//                 authenticated: false,
//                 error: 'User not found'
//             });
//         }

//         res.status(200).json({
//             authenticated: true,
//             user: {
//                 id: user.id,
//                 google_id: user.google_id,
//                 email: user.email,
//                 displayName: user.displayName,
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 picture: user.picture,
//                 lastLogin: user.lastLogin,
//                 createdAt: user.createdAt,
//                 lastUpdated: user.lastUpdated
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching user data:', error);
//         res.status(500).json({
//             authenticated: false,
//             error: 'Internal server error'
//         });
//     }
// });

// Verify JWT token endpoint (for other services)
// router.get('/verify', authenticateJWT, async (req, res) => {
//     try {
//         const jwtUser = req.jwtUser!;

//         // Fetch user data from database
//         const user = await prisma.user.findUnique({
//             where: { id: jwtUser.userId }
//         });

//         if (!user) {
//             return res.status(404).json({
//                 authenticated: false,
//                 error: 'User not found'
//             });
//         }

//         res.status(200).json({
//             authenticated: true,
//             user: {
//                 id: user.id,
//                 google_id: user.google_id,
//                 email: user.email,
//                 displayName: user.displayName
//             }
//         });
//     } catch (error) {
//         console.error('Error verifying user:', error);
//         res.status(500).json({
//             authenticated: false,
//             error: 'Internal server error'
//         });
//     }
// });

// Refresh access token using refresh token
router.post('/refresh', async (req, res) => {
    try {
        // Get refresh token from cookies
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token not provided' });
        }

        const { tokenId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as RefreshTokenPayload;
        const userId = await validateRefreshToken(tokenId);
        if (!userId) {
            return res.status(401).json({ error: 'Invalid or expired refresh token.' });
        }

        // Generate new access token
        const { accessToken } = generateTokens(userId, tokenId);

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