import { prisma } from './prisma';

export async function refreshTokenTtlIndex() {
    try {
        await prisma.$runCommandRaw({
            createIndexes: "RefreshToken",
            indexes: [
                {
                    key: { expiresAt: 1 },
                    name: "expiresAtTTL",
                    expireAfterSeconds: 0,
                },
            ],
        });
        console.log("TTL index ensured on RefreshToken");
    } catch (error) {
        console.error("Failed to ensure TTL index:", error);
    }
}
