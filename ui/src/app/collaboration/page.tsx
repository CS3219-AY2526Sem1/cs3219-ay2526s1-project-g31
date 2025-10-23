'use client';

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useMatch } from "@/contexts/MatchContext";
import { Question } from "shared";
import { io, Socket } from "socket.io-client";

export default function CollaborationPage() {
    const { user: me } = useUser();
    const { matchedUser } = useMatch();
    const [user, setUser] = useState("User");
    const [partner, setPartner] = useState("Partner");
    const [question, setQuestion] = useState<Question>();

    useEffect(() => {
        if (me) {
            setUser(me.displayName!);
        }
        if (matchedUser) {
            setPartner(matchedUser.displayName!);
        }
        const socket: Socket = io("http://localhost:3004");

        socket.on("connect", () => {
            console.log("[UI] Connected to server with ID:", socket.id);
            socket.emit("joinDummyRoom");
        });

        socket.on("receiveRoomData", (room) => {
            console.log("[UI] Dummy room data received:", room);
            setUser(room.users[0].displayName);
            setPartner(room.users[1].displayName);
            setQuestion(room.question);
        });

        socket.on("disconnect", () => {
            console.log("[UI] Disconnected from server");
        });

        return () => { socket.disconnect() };
    }, [me, matchedUser]);

    return (
        <div className="relative min-h-screen flex flex-col">
            <div className="bg-blue-500 flex items-center pt-1 pb-1 pl-3 pr-3">
                <h2 className="text-white text-3xl font-bold">PeerPrep</h2>

                <div className="flex-1"></div>

                <p className="pr-1">{user}</p>
                <p className="pl-1">{partner}</p>
            </div>

            <div className="flex flex-1">
                <div className="flex flex-1 flex-col">
                    <div className="flex-1 bg-blue-900 p-4 overflow-y-auto">
                        <h1 className="text-white text-center font-bold underline text-4xl mb-2">
                            {question?.title}
                        </h1>

                        <p className="text-white">
                            {question?.description}
                        </p>
                    </div>
                    <div className="flex-1 bg-black p-2">
                        <h1>Hi</h1>
                    </div>
                </div>
                <div className="flex-1 bg-orange-400 p-5">
                    <div className="w-full h-full bg-black">
                        <h1>Hi</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}