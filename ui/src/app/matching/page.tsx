'use client';

import { useUser } from "@/contexts/UserContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useEffect, useState } from "react"

export default function MatchingPage() {
    const { user } = useUser();
    const { ws } = useWebSocket();
    const [match, setMatch] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !ws) return;

        const registerUser = () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "register", userId: user.id }));
                console.log("[MatchingPage] Registered user:", user.id);
            }
        };

        // Register immediately if already open
        if (ws.readyState === WebSocket.OPEN) {
            registerUser();
        } else {
            ws.addEventListener("open", registerUser);
        }

        // Listen for match events
        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "match") {
                    setMatch(data.partner);
                    console.log("[MatchingPage] Match found:", data.partner);
                }
            } catch (err) {
                console.error("[MatchingPage] Failed to parse WS message", err);
            }
        };

        ws.addEventListener("message", handleMessage);

        // Cleanup
        return () => {
            ws.removeEventListener("open", registerUser);
            ws.removeEventListener("message", handleMessage);
        };
    }, [user, ws]);

    if (!user) {
        return <div className="text-white">Error: User not logged in</div>;
    }

    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Heading */}
            <h1 className="absolute top-10 left-1/2 transform -translate-x-1/2 text-white text-5xl font-bold z-10">
                Matching {match ? `with ${match}` : "in progress..."}
            </h1>

            {/* Two side-by-side boxes */}
            <div className="flex flex-1 h-screen">
                <div className="flex-1 bg-[#003D7C]"></div>
                <div className="flex-1 bg-[#EF7C00]"></div>
            </div>
        </div>
    )
}