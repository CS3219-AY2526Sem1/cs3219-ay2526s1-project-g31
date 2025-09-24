import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

router.get('/user/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id }
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to get user" });
    }
});

router.put('/user/:id', async (req, res) => {
    try {
        const { displayName, firstName, lastName, picture, email } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { displayName, firstName, lastName, picture, email }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

router.delete('/user/:id', async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;