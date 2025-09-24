import { Router } from "express";
import passport from "passport";
import { User } from '@shared/models/user';

const router = Router();
const UI_BASE_URL = `${process.env.BASE_URL}:${process.env.UI_PORT}`;

// Redirect to google for authentication
router.get('/google', passport.authenticate('google'));

// Handle callback from google
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${UI_BASE_URL}/auth/login` }),
    (req, res) => {
        // Redirect to homepage
        res.redirect(UI_BASE_URL);
    }
);

// Check if user is authenticated
router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ authenticated: false });
    }
    const user = req.user as User
    res.status(200).json({
        authenticated: true,
        user: user
    });
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

export default router;