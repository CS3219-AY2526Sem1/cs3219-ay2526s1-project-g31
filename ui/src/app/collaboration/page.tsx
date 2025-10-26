'use client';

import { useEffect, useState } from "react";
import { Question } from "shared";
import { io, Socket } from "socket.io-client";


let socket: Socket;

export default function CollaborationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [question, setQuestion] = useState<Question>();
    const [roomId, setRoomId] = useState<string>("");
    const [userA, setUserA] = useState<string>();
    const [userB, setUserB] = useState<string>();

    useEffect(() => {
        socket = io("http://localhost:3004");

        socket.on("connect", () => {
            console.log("[UI] Connected to server with ID:", socket.id);
        });

        socket.on("receiveUserData", () => {
            if (userA == undefined) {
                setUserA("userA");
            } else if (userB == undefined) {
                setUserB("userB");
            }
        })

        socket.on("receiveRoomData", (room) => {
            console.log("Room data received:", room);
            setQuestion(room.question);
        });

        socket.on("disconnect", () => {
            console.log("[UI] Disconnected from server");
        });

        return () => { socket.disconnect() };
    }, []);

    const sendMessage = async (message?: string) => {
        setIsLoading(true);
        if (message != undefined) {
            console.log("Message sent:", message);
        }
        setIsLoading(false);
    }

    const handleJoinRoom = async () => {
        if (!roomId?.trim()) return;
        socket.emit("joinRoom", { roomId });
    }
    
    return (
        <div className="relative min-h-screen flex flex-col">
            <div className="bg-blue-500 flex items-center pt-1 pb-1 pl-3 pr-3">
                <h2 className="text-white text-3xl font-bold">PeerPrep</h2>
                
                <div className="flex-1"></div>

                <p className="pr-1">{ (userA == undefined) ? "Not Joined" : userA }</p>
                <p className="pl-1">{ (userB == undefined) ? "Not Joined" : userB }</p>
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
                                onClick={ () => 
                                    {console.log("Button pressed")
                                    sendMessage(message)} }
                                disabled={ isLoading }
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

                        <div className="flex-1"></div>

                        <div className="flex border-2 border-white-100 pl-2 pr-2">
                            <input
                                className="flex-1 focus:outline-none"
                                type="text"
                                value={roomId}
                                placeholder="Enter room ID here"
                                onChange={ (e) => setRoomId(e.target.value) }
                            />
                            <button
                                onClick={ () => 
                                    handleJoinRoom()
                                }
                                disabled={ isLoading }
                                className=""
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}