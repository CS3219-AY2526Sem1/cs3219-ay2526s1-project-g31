import { Question } from "./question";

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