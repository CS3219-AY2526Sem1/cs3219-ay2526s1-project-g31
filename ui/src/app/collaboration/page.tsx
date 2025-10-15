'use client';

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function CollaborationPage() {
    useEffect(() => {
        socket = io("http://localhost:3004", { transports: ["websocket"] });

        socket.on("connect", () => {
            console.log("[Client] Connected to server with ID:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("[Client] Disconnected from server");
        });

        return () => { socket.disconnect() };
    }, []);

    const handleIncrement = () => {
        console.log("Increment button clicked");
    }
    
    return (
        <div className="relative min-h-screen flex flex-col">
            <h1 className="text-white text-5xl font-bold z-10">
                1
            </h1>

            <button
                onClick={handleIncrement}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
            >
                Click me
            </button>
        </div>
    )
}