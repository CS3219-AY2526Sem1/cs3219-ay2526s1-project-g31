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

import Spinner from "@/components/Spinner";
import { useMatch } from "@/contexts/MatchContext";
import { useAuth } from "@/contexts/AuthContext";
import { RoomPayload } from "shared";
import Link from "next/link";

const AI_MODES = ["hint", "suggest", "explain", "debug", "refactor", "testcases"] as const;

export default function CollaborationPage() {
    const { user } = useUser();
    const { matchedUser, clearMatchedUser, clearSessionStorage } = useMatch();
    const { accessToken, authFetch } = useAuth();
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
    const [userClosed, setUserClosed] = useState<string | null>(null);
    const [messages, setMessages] = useState<[string, string][]>([]);
    const [messageInput, setMessageInput] = useState<string>("");
    const [numAiPrompts, setNumAiPrompts] = useState<number>(3);
    const [roomData, setRoomData] = useState<RoomPayload>();

    // References
    const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor>(null);
    const providerRef = useRef<WebrtcProvider | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // AI Integration
    const [aiMessages, setAiMessages] = useState<[string, string][]>([]);
    const [aiInput, setAiInput] = useState<string>("");
    const [aiMode, setAiMode] = useState<typeof AI_MODES[number]>("hint");
    const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
    const [isSendingAiMessage, setIsSendingAiMessage] = useState<boolean>(false);

    // Language mapping for Editor
    const languageMap = new Map<string, string>([
        ["Python", "python"],
        ["JavaScript", "javascript"],
        ["Java", "java"],
        ["C++", "cpp"],
        ["C#", "csharp"],
        ["Go", "go"],
        ["Ruby", "ruby"],
    ]);

    useEffect(() => {
        return () => {
            console.log("unmounted");
            if (providerRef.current) {
                providerRef.current.destroy();
                providerRef.current = null;
            }

            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }

            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
                pollTimeoutRef.current = null;
            }

            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    /**
     * Handles Socket.IO emissions
     */
    useEffect(() => {
        try {
            const socket = io(process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL, {
                path: '/socket/collaboration',
                auth: {
                    token: accessToken
                },
                transports: ['websocket'],
            });
            socketRef.current = socket;

            socket.on("connect", () => {
                console.log("[Socket.IO] Connected as", socket.id);
            });

            socket.on("receive-message", ({ senderId, message }: { senderId: string; message: string }) => {
                console.log("[Socket.IO] Message received:", message);
                setMessages(prev => [...prev, [senderId, message]]);
            });

            socket.on("cancel-poll", ({ senderId }) => {
                router.push("/");
                if (senderId === user?.id) {
                    alert("Your partner did not join")
                } else {
                    alert("You did not join the room in time")
                }
            })

            socket.on("session-closing-start", ({ countdown, closedBy }) => {
                setIsClosing(true);
                setCountdown(countdown);

                if (user?.id !== closedBy) alert("Your partner requested to end the session");

                if (editorRef.current) editorRef.current.updateOptions({ readOnly: true });
            })

            socket.on("session-countdown-tick", ({ countdown }) => {
                setCountdown(countdown);
            })

            socket.on("session-closing-cancelled", ({ closedBy }) => {
                setIsClosing(false);
                setCountdown(null);

                if (user?.id !== closedBy) alert("Your partner requested to resume the session");

                if (editorRef.current) editorRef.current.updateOptions({ readOnly: false });
            })

            socket.on("ai-message", ({ senderId, prompt }: { senderId: string, prompt: string }) => {
                setAiMessages(prev => [...prev, [senderId, prompt]]);
                if (senderId === "AI") setIsSendingAiMessage(false);
            });

            socket.on("session-ended", () => {
                if (!user || !roomId) return;
                const removeFromCollection = async (userId: string, users: string[]) => {
                    try {
                        const res = await authFetch(`${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/clear/${roomId}`, {
                            method: "POST",
                            body: JSON.stringify({ userId })
                        });

                        if (!res.ok) {
                            console.error("Failed to clear data");
                            return;
                        }

                        const aiRes = await authFetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_BASE_URL}/api/ai/clear`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ users }),
                        });

                        if (!aiRes.ok) {
                            console.error("Failed to clear ai messages")
                        }
                    } catch (err) {
                        console.error("Error closing session:", err);
                        setError('Failed to close session');
                    }
                }

                removeFromCollection(user.id, roomId.split("_"));
                socket.disconnect();
                clearMatchedUser();
                clearSessionStorage();
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
    }, []);

    // UseEffect to create room when both users are ready
    useEffect(() => {
        if (!user || !matchedUser || !roomId) return;

        const getBothReady = async () => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/users/${user.id}/${matchedUser.userId}`
                );

                if (!res.ok) throw new Error("Failed to get readiness status");

                const data = await res.json();
                return data.bothReady;
            } catch (err) {
                console.error("Error getting readiness status:", err);
                setError("Failed to get readiness status");
            }
        }

        const createRoom = async () => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/room/${user.id}/${matchedUser.userId}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ difficulty: matchedUser.difficulty, topic: matchedUser.topic })
                    }
                );

                if (!res.ok) throw new Error('Failed to create room');

                const data = await res.json();
                return data.newRoom;
            } catch (err) {
                console.error("Error creating room:", err);
                setError("Failed to create room");
            }
        }

        const joinRoom = async (userId: string) => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/join/${roomId}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId })
                    }
                );

                if (!res.ok) throw new Error('Failed to create room');

                const data = await res.json();
                return data.newRoom;
            } catch (err) {
                console.error("Error creating room:", err);
                setError("Failed to create room");
            }
        }

        const cancelJoining = async (userId: string, users: string[]) => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/clear/${roomId}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ userId })
                    }
                );

                if (!res.ok) {
                    console.error("Failed to close session");
                    return;
                }

                const aiRes = await authFetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_BASE_URL}/api/ai/clear`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ users }),
                });

                if (!aiRes.ok) {
                    console.error("Failed to clear ai messages")
                }
            } catch (err) {
                console.error("Error closing session:", err);
                setError('Failed to close session');
            }
        }

        const poll = async () => {
            try {
                const bothReady = await getBothReady()

                if (bothReady) {
                    if (pollTimeoutRef.current) {
                        clearTimeout(pollTimeoutRef.current);
                        pollTimeoutRef.current = null;
                    }

                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }

                    console.log(`[Collaboration Page] Both ${user.id} and ${matchedUser.userId} are ready`);

                    const newRoom = await createRoom();
                    setRoomData(newRoom);

                    await joinRoom(user.id);

                    console.log(`[Collaboration Page] Room created: ${newRoom.roomId}`);
                    setIsRoomCreated(true);
                }
            } catch (err) {
                console.error("Error polling readiness status:", err);
                setError('Failed to check readiness');
            }
        };

        pollIntervalRef.current = setInterval(() => poll(), 1000);

        pollTimeoutRef.current = setTimeout(() => {
            if (pollIntervalRef.current) {
                console.warn("timed out");
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                cancelJoining(user.id, roomId.split("_"));
            }
        }, 60000)
    }, [user, matchedUser, roomId]);

    /**
     * Handles Yjs document retrieval
     */
    useEffect(() => {
        const fetchDoc = async () => {
            if (!roomId) return;

            const res = await authFetch(`${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/codespace/${roomId}`);
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
    const sendMessage = (senderId: string, message: string) => {
        const sendMessage = async (senderId: string, message: string) => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/message/${roomId}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ senderId, message })
                    }
                );

                if (!res.ok) {
                    console.error("Failed to send message");
                    return;
                }
            } catch (err) {
                console.error("Error sending message:", err);
                setError('Failed to send message');
            }
        }

        if (senderId === undefined) {
            sendMessage("", "Failed to send message");
        } else {
            sendMessage(senderId, message);
        }

        setMessageInput("");
    }

    /**
     * Handles session closure.
     */
    const handleClose = () => {
        const requestSessionClosing = async (userId: string) => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/close/${roomId}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ userId })
                    }
                );

                if (!res.ok) {
                    console.error("Failed to closing session");
                    return;
                }
            } catch (err) {
                console.error("Error closing session:", err);
                setError('Failed to close session');
            }
        }

        const cancelSessionClosing = async (userId: string) => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/cancel/${roomId}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ userId })
                    }
                );

                if (!res.ok) {
                    console.error("Failed to cancel session closure");
                    return;
                }
            } catch (err) {
                console.error("Error cancelling session closure:", err);
                setError('Failed to cancel session closure');
            }
        }

        if (!isClosing) {
            if (confirm("Do you want to close the session in 1 minute?")) {
                if (user?.id !== undefined) {
                    setUserClosed(user.id);
                    requestSessionClosing(user.id);
                }

            }
        } else {
            if (userClosed !== null && confirm("Cancel session closure?")) {
                if (user?.id !== undefined) {
                    setUserClosed(null);
                    cancelSessionClosing(user.id)
                }
            }
        }
    }

    /**
     * Sends a user prompt to the AI service.
     */
    const sendAiMessage = async () => {
        if (!user || !roomData || !editorRef.current || !aiInput.trim()) return;

        const sendMessage = async (senderId: string, message: string) => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL}/api/roomSetup/ai-message/${roomId}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ senderId, message })
                    }
                );

                if (!res.ok) {
                    console.error("Failed to send AI message");
                    return;
                }
            } catch (err) {
                console.error("Error sending message:", err);
                setError('Failed to send message');
            }
        }

        setIsSendingAiMessage(true);

        const userPrompt = aiInput;
        const code = editorRef.current.getValue();
        setAiInput("");

        try {
            sendMessage(user.id, userPrompt);

            const res = await authFetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_BASE_URL}/api/ai/${aiMode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: `${roomData.question.title}\n\n${roomData.question.description}`,
                    code: code || "",
                    prompt: userPrompt,
                    session_id: user.id,
                    numPrompts: numAiPrompts
                }),
            });

            const result = await res.json();
            sendMessage("AI", result.response || "No response from AI");
        } catch (error) {
            console.error("[Socket.IO] AI service error:", error);
            sendMessage("AI", "Failed to get response from AI service.");
        }

        if (numAiPrompts > 0) setNumAiPrompts(numAiPrompts - 1);
    };

    if (error) return <div>Error: {error}</div>;
    if (!roomData || !isRoomCreated) return <Spinner size="lg" fullScreen={true} />;

    return (
        <div className="relative h-screen flex flex-col bg-gray-900 overflow-hidden">
            {/**
             * Header
             */}
            <div className="bg-gray-800 border-b border-gray-700 flex items-center px-6 py-3 shadow-lg flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-100">PeerPrep</span>
                    </Link>
                </div>

                <div className="flex-1"></div>

                <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 bg-gray-700 rounded-lg border border-gray-600">
                        <span className="text-gray-300 text-sm">{user?.displayName || "User"}</span>
                    </div>
                    <div className="px-3 py-1 bg-gray-700 rounded-lg border border-gray-600">
                        <span className="text-gray-300 text-sm">{matchedUser?.displayName || "Matched User"}</span>
                    </div>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isClosing
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                        onClick={() => handleClose()}
                    >
                        {isClosing ? (userClosed === null ? `Ending (${countdown}s)` : `Cancel? (${countdown}s)`) : "End Session"}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
                <div className="flex flex-1 flex-col min-h-0">
                    {/**
                     * Space for Question details
                     */}
                    <div className="flex-1 bg-gray-800 p-6 overflow-y-auto border-r border-gray-700 min-h-0">
                        <h1 className="text-white text-center font-bold text-3xl mb-4">
                            {roomData.question.title}
                        </h1>

                        <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                            {roomData.question.description}
                        </div>
                    </div>
                    {/**
                     * Chat Box
                     */}
                    <div className="flex flex-col bg-gray-900 border-r border-gray-700 h-80 flex-shrink-0">
                        <div className="flex-1 p-4 overflow-y-auto space-y-2 min-h-0">
                            {messages.map(([senderId, message], idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-lg ${senderId === ""
                                        ? "bg-gray-700 text-gray-300"
                                        : roomId?.split("_")[0] === senderId
                                            ? "bg-blue-600/20 border border-blue-600/50 text-blue-300"
                                            : "bg-green-600/20 border border-green-600/50 text-green-300"
                                        }`}
                                >
                                    <span className="font-semibold">
                                        {senderId === user?.id ? user.displayName : matchedUser?.displayName}
                                    </span>
                                    <span className="text-gray-400">: </span>
                                    <span>{message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 border-r border-t border-gray-700 flex-shrink-0">
                        <div className="flex space-x-2">
                            <input
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        setIsSendingMessage(true);
                                        if (user) sendMessage(user.id, messageInput)
                                        setIsSendingMessage(false);
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    setIsSendingMessage(true);
                                    if (user) sendMessage(user.id, messageInput)
                                    setIsSendingMessage(false);
                                }}
                                disabled={isSendingMessage}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                {isSendingMessage ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* =================== AI Sidebar =================== */}
                {/* Floating toggle button */}
                <button
                    className="fixed bottom-6 right-6 bg-yellow-600 hover:bg-yellow-700 p-4 rounded-full shadow-2xl z-50 text-white font-bold transition-colors"
                    onClick={() => setIsAiOpen(true)}
                >
                    🤖 AI
                </button>

                {/* Sidebar container */}
                <div
                    className={`fixed top-0 right-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-2xl transform transition-transform duration-300 
                        ${isAiOpen ? "translate-x-0" : "translate-x-full"} flex flex-col z-50`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
                        <h3 className="text-white font-bold text-lg">AI Assistant</h3>
                        <div className="flex items-center space-x-3">
                            <span className="text-gray-400 text-sm">{numAiPrompts} uses left</span>
                            <button
                                className="text-gray-400 hover:text-white text-xl font-bold transition-colors"
                                onClick={() => setIsAiOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Messages container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {aiMessages.map(([sender, msg], idx) => {
                            const isAI = sender === "AI";
                            const isCurrentUser = sender === roomId?.split("_")[0];
                            const bgColor = isAI
                                ? "bg-yellow-600/20 border border-yellow-600/50"
                                : isCurrentUser
                                    ? "bg-blue-600/20 border border-blue-600/50"
                                    : "bg-green-600/20 border border-green-600/50";
                            const textColor = isAI ? "text-yellow-300" : isCurrentUser ? "text-blue-300" : "text-green-300";

                            return (
                                <div key={idx} className={`p-3 rounded-lg ${bgColor}`}>
                                    <div className={`font-semibold text-sm mb-1 ${textColor}`}>
                                        {sender === user?.id ? user.displayName : sender === "AI" ? "AI" : matchedUser?.displayName}
                                    </div>
                                    <div className="text-gray-200 text-sm whitespace-pre-wrap">{msg}</div>
                                </div>
                            );
                        })}
                    </div>


                    {/* Input + mode selector */}
                    <div className="p-4 border-t border-gray-700 bg-gray-900 space-y-3">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Mode</label>
                            <select
                                value={aiMode}
                                onChange={(e) => setAiMode(e.target.value as typeof AI_MODES[number])}
                                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                {AI_MODES.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex space-x-2">
                            <input
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                type="text"
                                value={aiInput}
                                placeholder="Ask AI for help..."
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendAiMessage();
                                }}
                            />
                            <button
                                onClick={sendAiMessage}
                                disabled={isSendingAiMessage}
                                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                {isSendingAiMessage ? "..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>

                {/**
                 * Code Space Editor
                 */}
                <div className="flex flex-1 flex-col bg-gray-900 p-6 overflow-hidden min-h-0">
                    <div className="flex-1 min-h-0 relative">
                        <Editor
                            className="h-full"
                            width="100%"
                            theme="vs-dark"
                            language={languageMap.get((matchedUser) ? matchedUser?.language : "python")}
                            options={{
                                padding: { top: 20, bottom: 20 },
                                readOnly: isClosing
                            }}
                            onMount={(editor) => {
                                editorRef.current = editor;
                                setIsEditorReady(true);

                                const resizeObserver = new ResizeObserver(() => editor.layout());
                                resizeObserver.observe(editor.getDomNode()!);

                                return () => resizeObserver.disconnect();
                            }}
                        />
                    </div>


                    {isClosing && (
                        <div className="mt-4 bg-yellow-600/20 border border-yellow-600 text-yellow-300 text-center py-3 px-4 rounded-lg shadow-lg transition-all duration-300">
                            <span className="font-semibold">⚠️ Session ending in {countdown ?? 60}s</span>
                            <span className="text-sm block mt-1">Editor is now locked</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
