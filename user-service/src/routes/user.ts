import { Router, Request } from "express";
import { prisma } from "../db/prisma";
import { verifyAccessToken } from "../middleware/jwt";

interface JwtRequest extends Request {
    auth?: {
        userId: string;
        iat: number;
        exp: number;
    };
}

const router = Router();
router.use(verifyAccessToken);
// TODO: add role-based access control (RBAC) middleware: allow admin to access all routes, regular users only their own data

router.get('/me', async (req: JwtRequest, res) => {
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

router.put('/me', async (req: JwtRequest, res) => {
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

router.delete('/me', async (req: JwtRequest, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        await prisma.user.delete({
            where: { id: userId },
        });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// router.get('/:id', async (req, res) => {
//     try {
//         const user = await prisma.user.findUnique({
//             where: { google_id: req.params.id }
//         });
//         if (!user) return res.status(404).json({ error: "User not found" });
//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ error: "Failed to get user" });
//     }
// });

// router.put('/:id', async (req, res) => {
//     try {
//         const { displayName, firstName, lastName, picture, email } = req.body;
//         const user = await prisma.user.update({
//             where: { google_id: req.params.id },
//             data: { displayName, firstName, lastName, picture, email }
//         });
//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ error: "Failed to update user" });
//     }
// });

// router.delete('/:id', async (req, res) => {
//     try {
//         await prisma.user.delete({
//             where: { google_id: req.params.id },
//         });
//         res.json({ message: "User deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: "Failed to delete user" });
//     }
// });

export default router;