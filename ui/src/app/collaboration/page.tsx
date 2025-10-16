'use client';

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function CollaborationPage() {
    useEffect(() => {
        const socket: Socket = io("http://localhost:3004");

        socket.on("connect", () => {
            console.log("[UI] Connected to server with ID:", socket.id);
            socket.emit("joinDummyRoom");
        });

        socket.on("roomData", (room) => {
            console.log("[UI] Dummy room data received:", room);
        });

        socket.on("disconnect", () => {
            console.log("[UI] Disconnected from server");
        });

        return () => { socket.disconnect() };
    }, []);
    
    return (
        <div className="relative min-h-screen flex flex-col">
            <h1 className="text-white text-5xl font-bold z-10">
                1
            </h1>

            <button
                onClick={ () => console.log("clicked") }
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
            >
                Click me
            </button>
        </div>
    )
}