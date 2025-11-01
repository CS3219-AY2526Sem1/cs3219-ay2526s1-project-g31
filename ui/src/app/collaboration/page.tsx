'use client';

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter, useSearchParams } from "next/navigation";

import { io, Socket } from "socket.io-client";
import { Editor } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs"

import { RoomPayload } from "../../../../collaboration-service/src/model/room";
import Spinner from "@/components/Spinner";
import { useMatch } from "@/contexts/MatchContext";

let socket: Socket;
const AI_MODES = ["hint", "suggest", "explain", "debug", "refactor", "testcases"] as const;

export default function CollaborationPage() {
    const { user } = useUser();
    const { matchedUser } = useMatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId");
    
    const [codespace, setCodespace] = useState<Y.Doc | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [isRoomCreated, setIsRoomCreated] = useState<boolean>(false);
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
    const [messages, setMessages] = useState<[string, string][]>([]);
    const [messageInput, setMessageInput] = useState<string>("");
    const [roomData, setRoomData] = useState<RoomPayload>();

    // References
    const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor>(null);
    const providerRef = useRef<WebrtcProvider | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // AI Integration
    const [aiMessages, setAiMessages] = useState<[string, string][]>([]);
    const [aiInput, setAiInput] = useState<string>("");
    const [aiMode, setAiMode] = useState<typeof AI_MODES[number]>("hint");
    const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
    const [isSendingAiMessage, setIsSendingAiMessage] = useState<boolean>(false);

    /**
     * Handles Socket.IO emissions
     */
    useEffect(() => {
        socket = io("http://localhost:3004");

        socket.on("connect", () => {
            console.log("[Socket.IO] Connected as", socket.id);
        });

        socket.on("receive-message", ({ senderId, message }: { senderId: string; message: string }) => {
            console.log("[Socket.IO] Message received:", message);
            setMessages(prev => [...prev, [senderId, message]]);
        });

        socket.on("session-closing-start", ({ countdown }) => {
            console.log(`Request received: ${countdown}`);
            setIsClosing(true);
            setCountdown(countdown);
        })

        socket.on("session-countdown-tick", ({ countdown }) => {
            setCountdown(countdown);
        })

        socket.on("session-closing-cancelled", () => {
            setIsClosing(false);
            setCountdown(null);
        })

        socket.on("session-ended", () => {
            const removeFromCollection = async () => {
                try {
                    const res = await fetch(`http://localhost:3004/api/roomSetup/close/${roomId}`);

                    if (!res.ok) {
                        console.error("Failed to end session");
                        return;
                    }
                } catch (err) {
                    console.error("Error closing session:", err);
                    setError('Failed to close session');
                }
            }

            removeFromCollection();

            if (providerRef.current) {
                providerRef.current.destroy();
                providerRef.current = null;
            }

            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }

            socket.disconnect();

            setIsClosing(false);
            setCountdown(null);
            setCodespace(null);
            setRoomData(undefined);
            setMessages([]);

            console.log("[Socket.IO] Session closed by server");
            alert("Session closed");
            router.push('/');
        })

        socket.on("disconnect", () => {
            console.log("[Socket.IO] Disconnected");
        });

        return () => {
            socket.off("receive-message");
            socket.off("session-closing-start");
            socket.off("session-countdown-tick");
            socket.off("session-closing-cancelled");
            socket.off("session-ended");
            socket.disconnect();
        };
    }, []);

    // UseEffect to create room when both users are ready
    useEffect(() => {
        if (!user || !matchedUser || !roomId) return;
        
        const poll = async () => {
            try {
                const res = await fetch(
                    `http://localhost:3004/api/roomSetup/users/${user.id}/${matchedUser.userId}`
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

                    console.log(`[Collaboration Page] Both ${user.id} and ${matchedUser.userId} are ready`);

                    const roomRes = await fetch(
                        `http://localhost:3004/api/roomSetup/room/${user.id}/${matchedUser.userId}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                        }
                    );

                    if (!roomRes.ok) throw new Error('Failed to create room');

                    const roomData = await roomRes.json();
                    setRoomData(roomData.newRoom);

                    socket.emit("join-room", { roomId });

                    console.log(`[Collaboration Page] Room created: ${roomData.newRoom.roomId}`);
                    setIsRoomCreated(true);
                }
            } catch (err) {
                console.error("Error polling readiness status:", err);
                setError('Failed to check readiness');
            }
        };
        
        pollIntervalRef.current = setInterval(() => poll(), 1000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [user, matchedUser, roomId]);

    /**
     * Handles Yjs document retrieval
     */
    useEffect(() => {
        const fetchDoc = async () => {
            if (!roomId) return;

            const res = await fetch(`http://localhost:3004/api/roomSetup/codespace/${roomId}`);
            const data = await res.json();

            if (!data?.doc) return;

            const state = Uint8Array.from(atob(data.doc), c => c.charCodeAt(0));

            const ydoc = new Y.Doc();
            Y.applyUpdate(ydoc, state);

            setCodespace(ydoc);
        };

        fetchDoc();
    }, [roomData]);

    /**
     * Handles Yjs injection to Monaco Editor
     */
    useEffect(() => {
        if (!codespace || !editorRef.current || !roomId) return;

        const editor = editorRef.current;
        const model = editor.getModel();
        if (!model) return;

        const provider = new WebrtcProvider(roomId, codespace, {
            signaling: ["wss://y-webrtc.fly.dev"]
        });
        providerRef.current = provider;

        try {
            provider.awareness.setLocalStateField("user", {
                name: user?.displayName ?? "Anonymous",
                id: user?.id ?? null
            });
        } catch (e) {
            console.warn("Could not set awareness:", e);
        }

        provider.on("synced", (isSynced) => {
            console.log(`[Y.Webrtc] synced=${isSynced} room=${roomId}`);
        });

        const yText = codespace.getText("monaco");
        const binding = new MonacoBinding(
            yText,
            model,
            new Set([editor]),
            provider.awareness
        );

        return () => {
            binding.destroy();
            provider.destroy();
        };
    }, [codespace, isEditorReady]);

    /**
     * Notifies Server that message is being sent.
     * 
     * @param senderId Display name of user sending the message.
     * @param message Message content to be sent.
     */
    const sendMessage = (senderId: string | undefined, message: string) => {
        if (senderId === undefined) {
            socket.emit("message", { roomId, senderId: "", message: "Failed to send message" });
        } else {
            socket.emit("message", { roomId, senderId, message })
        }
        
        setMessageInput("");
    }

    /**
     * Handles session closure.
     */
    const handleClose = () => {
        if (!isClosing) {
            if (confirm("Do you want to close the session in 1 minute?")) {
                console.log(roomId);
                socket.emit("session-closing-request", { roomId });
            }
        } else {
            if (confirm("Cancel session closure?")) {
                socket.emit("session-cancel-closing", { roomId });
            }
        }
    }

    /**
     * Sends a user prompt to the AI service.
     */
    const sendAiMessage = async () => {
        if (!user || !roomData || !aiInput.trim()) return; // Ensure user and question exist
        setIsSendingAiMessage(true);

        // Get code from editor if any
        const code = editorRef.current?.getValue() ?? "";

        setAiMessages(prev => [...prev, [user.displayName ?? "You", aiInput]]);

        try {
            const res = await fetch(`http://localhost:3005/api/ai/${aiMode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: `${roomData.question.title}\n\n${roomData.question.description}`, // title + description
                    code: code || "",
                    prompt: aiInput,
                    session_id: user.id
                })
            });

            const data = await res.json();

            // Add AI response to chat
            if (data.response) {
                setAiMessages(prev => [...prev, ["AI", data.response]]);
            } else {
                setAiMessages(prev => [...prev, ["AI", "No response from AI"]]);
            }
        } catch (err) {
            console.error(err);
            setAiMessages(prev => [...prev, ["AI", "Failed to get response from AI"]]);
        } finally {
            setMessageInput("");
            setIsSendingAiMessage(false);
        }
    };

    if (error) return <div>Error: {error}</div>;
    if (!roomData || !isRoomCreated) return <Spinner size="lg" fullScreen={true} />;

    return (
        <div className="relative min-h-screen flex flex-col">
            {/**
             * Header
             */}
            <div className="bg-blue-500 flex items-center pt-1 pb-1 pl-3 pr-3">
                <h2 className="text-white text-3xl font-bold">PeerPrep</h2>

                <div className="flex-1"></div>

                <p className="p-1 border-1 border-white rounded mr-1">
                    { (user?.displayName === undefined) ? "User" : user.displayName }
                </p>
                <p className="p-1 border-1 border-white rounded ml-1">
                    { (matchedUser?.displayName === undefined) ? "Matched User" : matchedUser.displayName }
                </p>
                <button
                    className={`p-1 ml-2 border-2 border-black rounded text-white ${(isClosing) ? "bg-red-500" : "bg-red-600"}`}
                    onClick={ () => handleClose() }
                >
                    {(isClosing) ? `Cancel? (${countdown}s)` : "End Session"}
                </button>
            </div>

            <div className="flex flex-1">
                <div className="flex flex-1 flex-col">
                    {/**
                     * Space for Question details
                     */}
                    <div className="flex-1 bg-blue-900 p-4 overflow-y-auto">
                        <h1 className="text-white text-center font-bold underline text-4xl mb-2">
                            {roomData.question.title}
                        </h1>

                        <p className="text-white">
                            {roomData.question.description}
                        </p>
                    </div>
                    {/**
                     * Chat Box
                     */}
                    <div className="flex flex-1 flex-col bg-black p-2 overflow-y-auto">
                        <div className="flex flex-col">
                            {messages.map(([senderId, message], idx) => (
                                <p
                                    key={idx}
                                    // Have to change so that text color is deterministic for users
                                    className={`text-1xl mb-2 ${
                                        senderId === "" ? "text-white" :
                                        (roomId?.split("_")[0] === senderId) ? "text-blue-500" : "text-green-500"
                                    }`
                                }>
                                    {(senderId === user?.id) ? user.displayName : matchedUser?.displayName}: {message}
                                </p>
                            ))}
                        </div>
                        
                        <div className="flex-1"></div>

                        
                    </div>
                    <div className="bg-black p-2">
                        <div className="flex border-2 border-white-100 pl-2 pr-2">
                            <input
                                className="flex-1 focus:outline-none"
                                type="text"
                                value={messageInput}
                                placeholder="Enter message here"
                                onChange={ (e) => setMessageInput(e.target.value) }
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        setIsSendingMessage(true);
                                        if (user) sendMessage(user.id, messageInput) 
                                        setIsSendingMessage(false);
                                    }
                                }}
                            />
                            <button
                                onClick={ () => { 
                                    setIsSendingMessage(true);
                                    if (user) sendMessage(user.id, messageInput) 
                                    setIsSendingMessage(false);
                                }}
                                disabled={ isSendingMessage }
                                className=""
                            >
                                {isSendingMessage ? "Loading..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* =================== AI Sidebar =================== */}
                {/* Floating toggle button */}
                <button
                    className="fixed bottom-4 right-4 bg-yellow-500 p-3 rounded-full shadow-lg z-50"
                    onClick={() => setIsAiOpen(true)}
                >
                    AI
                </button>

                {/* Sidebar container */}
                <div
                    className={`fixed top-0 right-0 h-full w-96 bg-gray-900 shadow-lg transform transition-transform duration-300 
                        ${isAiOpen ? "translate-x-0" : "translate-x-full"} flex flex-col z-50`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h3 className="text-white font-bold text-lg">AI Chat</h3>
                        <button
                            className="text-white text-xl font-bold"
                            onClick={() => setIsAiOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {aiMessages.map(([sender, msg], idx) => (
                            <p
                                key={idx}
                                className={`text-sm ${sender === "AI" ? "text-yellow-400" : "text-blue-500"
                                    }`}
                            >
                                <strong>{sender}:</strong> {msg}
                            </p>
                        ))}
                    </div>

                    {/* Input + mode selector */}
                    <div className="p-4 border-t border-gray-700 flex flex-col space-y-2">
                        <select
                            value={aiMode}
                            onChange={(e) => setAiMode(e.target.value as typeof AI_MODES[number])}
                            className="p-2 rounded bg-gray-800 text-white"
                        >
                            {AI_MODES.map((mode) => (
                                <option key={mode} value={mode}>
                                    {mode}
                                </option>
                            ))}
                        </select>

                        <div className="flex space-x-2">
                            <input
                                className="flex-1 p-2 rounded bg-gray-800 text-white focus:outline-none"
                                type="text"
                                value={aiInput}
                                placeholder="Send message to AI"
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendAiMessage();
                                }}
                            />
                            <button
                                onClick={sendAiMessage}
                                disabled={isSendingAiMessage}
                                className="bg-yellow-500 p-2 rounded text-black"
                            >
                                {isSendingAiMessage ? "Loading..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>

                {/**
                 * Code Space Editor
                 */}
                <div className="flex flex-1 bg-orange-400 p-5">
                    <Editor
                        height="100%"
                        width="100%"
                        theme="vs-dark"
                        options={{ padding: { top: 20, bottom: 20 } }}
                        onMount={(editor) => { 
                            editorRef.current = editor;
                            setIsEditorReady(true);
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
