import { Router } from "express";
import passport from "passport";

const router = Router();

// Redirect to google for authentication
router.get('/google', passport.authenticate('google'));

// Handle callback from google
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/auth/login' }),
    (req, res) => {
        res.redirect('http://localhost:3000/');
    }
);

// Check if user is authenticated
router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ authenticated: false });
    }
    res.status(200).json({
        authenticated: true,
        user: {
            id: "req.user.id",
            name: "req.user.name",
            email: "req.user.email",
            picture: undefined
        }
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