const MATCH_TTL = 60; // 1 minute

interface UserMatchInfo {
    userId: string;
    displayName: string;
    email?: string;
    picture?: string;
    difficulty: string;
    topic: string;
    language: string;
}

export { UserMatchInfo, MATCH_TTL };