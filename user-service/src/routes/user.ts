import { Router } from "express";
import { prisma } from "../db/prisma";
import { UserRole } from "@prisma/client";
import { verifyAccessToken, authorizedRoles, JwtRequest } from "shared";
import { validate } from "../middleware/validate";
import { adminUpdateUserSchema, idParamSchema, searchUsersQuerySchema, updateMeSchema } from "../validators/user";

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

router.put('/me', authorizeUser, validate({ body: updateMeSchema }), async (req: JwtRequest, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { displayName, picture } = (req as any).validatedBody as { displayName?: string; picture?: string };
        const user = await prisma.user.update({
            where: { id: userId },
            data: { displayName, picture }
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

router.get('/search', authorizeAdmin, validate({ query: searchUsersQuerySchema }), async (req, res) => {
    try {
        const { q } = (req as any).validatedQuery as { q: string };
        const take = 20; // Limit results to 20 users

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { google_id: { contains: q, mode: 'insensitive' } },
                    { displayName: { contains: q, mode: 'insensitive' } },
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ]
            },
            take
        });

        res.json(users);
    } catch (err) {
        console.error('Search users error:', err);
        res.status(500).json({ error: "Failed to search users" });
    }
});

router.put('/:id', authorizeAdmin, validate({ params: idParamSchema, body: adminUpdateUserSchema }), async (req, res) => {
    try {
        const { displayName, firstName, lastName, picture, email, role } = (req as any).validatedBody as {
            displayName?: string; firstName?: string; lastName?: string; picture?: string; email?: string; role?: UserRole;
        };

        const data: any = { displayName, firstName, lastName, picture, email };
        if (role) data.role = role; // Don't set role if not provided

        const user = await prisma.user.update({
            where: { google_id: (req as any).validatedParams.id },
            data
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

router.delete('/:id', authorizeAdmin, async (req, res) => {
    try {
        await prisma.refreshToken.deleteMany({
            where: {
                user: {
                    google_id: req.params.id,
                },
            },
        });

        await prisma.user.delete({
            where: { google_id: req.params.id },
        });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;
