'use client';

import { useEffect, useState } from "react";
import { Question } from "shared";
import { io, Socket } from "socket.io-client";


let socket: Socket;

export default function CollaborationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>();
    const [question, setQuestion] = useState<Question>();
    const [userA, setUserA] = useState("UserA");
    const [userB, setUserB] = useState("UserB");

    useEffect(() => {
        const socket: Socket = io("http://localhost:3004");

        socket.on("connect", () => {
            console.log("[UI] Connected to server with ID:", socket.id);
            socket.emit("joinDummyRoom");
        });

        socket.on("receiveRoomData", (room) => {
            console.log("[UI] Dummy room data received:", room);
            setUserA(room.users[0].displayName);
            setUserB(room.users[1].displayName);
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
    
    return (
        <div className="relative min-h-screen flex flex-col">
            <div className="bg-blue-500 flex items-center pt-1 pb-1 pl-3 pr-3">
                <h2 className="text-white text-3xl font-bold">PeerPrep</h2>
                
                <div className="flex-1"></div>

                <p className="pr-1">{userA}</p>
                <p className="pl-1">{userB}</p>
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
                                className="flex-1"
                                type="text"
                                value=""
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
                <div className="flex-1 bg-orange-400 p-5">
                    <div className="w-full h-full bg-black">
                        <h1>Code editor</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}