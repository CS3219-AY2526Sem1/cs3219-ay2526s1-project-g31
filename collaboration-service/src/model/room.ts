import { Question } from "shared";
import { PublicUser } from "./publicUser";

/**
 * Data of the collaboration room session.
 */
export interface RoomPayload {
    roomId: string;
    userIds: string[];
    question: Question;
    createdAt: number;
    lastActiveAt: number;
}
