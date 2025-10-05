import { Router } from "express";
import { prisma } from "../db/prisma";
import { UserRole } from "@prisma/client";
import { verifyAccessToken, authorizedRoles, JwtRequest } from "shared";

const authorizeUser = authorizedRoles([UserRole.USER, UserRole.ADMIN]);
const authorizeAdmin = authorizedRoles([UserRole.ADMIN]);

const router = Router();
router.use(verifyAccessToken);

router.get('/me', authorizeUser, async (req: JwtRequest, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to get user" });
    }
});

router.put('/me', authorizeUser, async (req: JwtRequest, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { displayName } = req.body; // Can extend to other fields as needed
        const user = await prisma.user.update({
            where: { id: userId },
            data: { displayName }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

router.delete('/me', authorizeUser, async (req: JwtRequest, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Delete all refresh tokens for the user
        await prisma.refreshToken.deleteMany({
            where: { userId },
        });

        // Delete the user
        await prisma.user.delete({
            where: { id: userId },
        });

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

router.get('/:id', authorizeAdmin, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { google_id: req.params.id }
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to get user" });
    }
});

router.put('/:id', authorizeAdmin, async (req, res) => {
    try {
        const { displayName, firstName, lastName, picture, email } = req.body;
        const user = await prisma.user.update({
            where: { google_id: req.params.id },
            data: { displayName, firstName, lastName, picture, email }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

router.delete('/:id', authorizeAdmin, async (req, res) => {
    try {
        await prisma.user.delete({
            where: { google_id: req.params.id },
        });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;