import { Question } from "shared";
import { PublicUser } from "./publicUser";

export interface RoomPayload {
    roomId: string;
    users: PublicUser[];
    question: Question;
    createdAt: number;
    lastActiveAt: number;
}
