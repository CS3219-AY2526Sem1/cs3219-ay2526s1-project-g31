'use client';

import { useEffect, useRef, useState } from "react";
import { RoomPayload } from "../../../../collaboration-service/src/model/room";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Spinner from "@/components/Spinner";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function CollaborationPage() {
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [isRoomCreated, setIsRoomCreated] = useState<boolean>(false);
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [roomData, setRoomData] = useState<RoomPayload>();

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId");

    useEffect(() => {
        socket = io("http://localhost:3004");

        socket.on("connect", () => {
            console.log("[Socket.IO] Connected as", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("[Socket.IO] Disconnected");
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // UseEffect to create room when both users are ready
    useEffect(() => {
        if (!user || !roomId) return;

        let isMounted = true;

        const fetchMatchedUserId = async () => {
            try {
                const res = await fetch(`http://localhost:3002/api/match/getMatchedUserId/${user.id}`);

                if (!res.ok) {
                    console.error("Failed to fetch matched user ID");
                    return null;
                }

                const matchedIdData = await res.json();
                const matchedUserId = matchedIdData.matchedUserId;

                if (!isMounted || !matchedUserId) return null;

                console.log("Fetched matched user ID:", matchedUserId);

                return matchedUserId;
            } catch (err) {
                console.error("Error fetching matched user ID:", err);
            }

            return null;
        };

        const getMatchedUserDetails = async (): Promise<string | undefined> => {
            try {
                const res = await fetch(`http://localhost:3002/api/match/getMatchedUser/${user.id}`);

                if (!res.ok) {
                    console.error("Failed to fetch matched user");
                    return undefined;
                }

                const data = await res.json();

                if (data.matchedUser) {
                    return data.matchedUser.displayName;
                } else {
                    console.warn("Matched user not found for", user.id);
                    return undefined;
                }
            } catch (err) {
                console.error("Error fetching room data:", err);
                return undefined;
            }
        };
        
        const poll = async (matchedUserId: string) => {
            try {
                const res = await fetch(
                    `http://localhost:3002/api/match/ready/${user.id}/${matchedUserId}`
                );

                if (!res.ok) {
                    console.error("Failed to poll readiness status");
                    return;
                }

                const data = await res.json();

                if (data.bothReady) {
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }

                    console.log(`[Collaboration Page] Both ${user.id} and ${matchedUserId} are ready`);

                    const matchedUserDisplayName = await getMatchedUserDetails();

                    if (matchedUserDisplayName === undefined) {
                        setError('Failed to fetch matched user data');
                        return;
                    }

                    const roomRes = await fetch(
                        `http://localhost:3004/api/roomSetup/createRoom/${user.id}/${matchedUserId}`,
                        {
                            method: 'POST',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                userDisplayName: user.displayName,
                                matchedUserDisplayName: matchedUserDisplayName,
                            })
                        }
                    );

                    if (!roomRes.ok) throw new Error('Failed to create room');

                    const roomData = await roomRes.json();
                    setRoomData(roomData.newRoom);

                    console.log(`[Collaboration Page] Room created: ${roomData.newRoom.roomId}`);
                    setIsRoomCreated(true);
                }
            } catch (err) {
                console.error("Error polling readiness status:", err);
                setError('Failed to check readiness');
            }
        };

        fetchMatchedUserId().then((matchedUserId) => {
            if (matchedUserId) {
                pollIntervalRef.current = setInterval(() => poll(matchedUserId), 1000);
            }
        });

        return () => {
            isMounted = false;
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [user, roomId]);

    const sendMessage = (message: string) => {
        console.log(message);
        socket.emit("message", { message });
    }

    if (error) return <div>Error: {error}</div>;
    if (!roomData || !isRoomCreated) return <Spinner size="lg" fullScreen={true} />;

    return (
        <div className="relative min-h-screen flex flex-col">
            <div className="bg-blue-500 flex items-center pt-1 pb-1 pl-3 pr-3">
                <h2 className="text-white text-3xl font-bold">PeerPrep</h2>

                <div className="flex-1"></div>

                <p className="pr-1">{ roomData.users[0].displayName }</p>
                <p className="pl-1">{ roomData.users[1].displayName }</p>
            </div>

            <div className="flex flex-1">
                <div className="flex flex-1 flex-col">
                    <div className="flex-1 bg-blue-900 p-4 overflow-y-auto">
                        <h1 className="text-white text-center font-bold underline text-4xl mb-2">
                            {roomData.question.title}
                        </h1>

                        <p className="text-white">
                            {roomData.question.description}
                        </p>
                    </div>
                    <div className="flex flex-1 flex-col bg-black p-2">
                        {/** Display messages */}
                        
                        <div className="flex-1"></div>

                        <div className="flex border-2 border-white-100 pl-2 pr-2">
                            <input
                                className="flex-1 focus:outline-none"
                                type="text"
                                value={message}
                                placeholder="Enter message here"
                                onChange={ (e) => setMessage(e.target.value) }
                            />
                            <button
                                onClick={ () => {
                                    sendMessage(message) 
                                    setMessage("");
                                }}
                                disabled={ isSendingMessage }
                                className=""
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-1 bg-orange-400 p-5">
                    <div className="flex flex-1 flex-col bg-black p-2">
                        <h1>Code editor</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}