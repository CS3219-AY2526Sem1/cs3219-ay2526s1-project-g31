'use client';

import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMatch } from "@/contexts/MatchContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Spinner from "@/components/Spinner";
import Header from "@/components/Header";
import { difficulty as d, topic as t, language as l } from "@/constants/question";
import { io, Socket } from "socket.io-client";

const Difficulty = { ...d, ANY: 'Any' };
const Topic = { ...t, ANY: 'Any' };
const Language = { ...l, ANY: 'Any' };

export default function MatchingPage() {
    const { user } = useUser();
    const { accessToken, authFetch } = useAuth();
    const { matchedUser, setMatchedUser, clearMatchedUser } = useMatch();
    const router = useRouter();

    const [difficulty, setDifficulty] = useState(Difficulty.EASY);
    const [topic, setTopic] = useState(Topic.ARRAY);
    const [language, setLanguage] = useState(Language.PYTHON);
    const [isMatching, setIsMatching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup socket on unmount
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const handleStartMatching = async () => {
        if (!user || !accessToken) {
            setError('Please log in to start matching');
            return;
        }

        setIsMatching(true);
        setError(null);
        clearMatchedUser();

        try {
            // Connect to matching service through API Gateway
            const socket = io(process.env.NEXT_PUBLIC_MATCHING_SERVICE_BASE_URL, {
                path: '/socket/matching',
                auth: {
                    token: accessToken
                },
                transports: ['websocket', 'polling'],
            });
            socketRef.current = socket;

            socket.on('connect', async () => {
                try {
                    const response = await authFetch(`${process.env.NEXT_PUBLIC_MATCHING_SERVICE_BASE_URL}/api/match/start`, {
                        method: 'POST',
                        body: JSON.stringify({
                            userId: user.id,
                            displayName: user.displayName,
                            email: user.email,
                            picture: user.picture,
                            difficulty: difficulty,
                            topic: topic,
                            language: language,
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to start matching');
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to start matching');
                    setIsMatching(false);
                    // Disconnect socket if still connected
                    if (socketRef.current) {
                        socketRef.current.disconnect();
                        socketRef.current = null;
                    }
                }
            });

            socket.on('match_found', (data) => {
                setMatchedUser({
                    userId: data.userId,
                    displayName: data.displayName,
                    email: data.email,
                    picture: data.picture,
                    difficulty: data.difficulty,
                    topic: data.topic,
                    language: data.language,
                });
                setIsMatching(false);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket.io connection error:', error);
                setError(`Connection error: ${error.message}`);
                setIsMatching(false);
            });

            socket.on('disconnect_reason', (data) => {
                setError(`Disconnected: ${data.reason}`);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket.io disconnected:', reason);
                setIsMatching(false);
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsMatching(false);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
    };

    const handleCancelMatching = async () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsMatching(false);
        setError(null);
    };

    const handleJoinRoom = async () => {
        if (!user || !matchedUser) return;

        console.log(`[Matching Page] ${user?.displayName} clicked Join Room`);

        try {
            await fetch("http://localhost:3004/api/roomSetup/me", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: user, matchedUser: matchedUser }),
            });
        } catch (err) {
            console.error("Error notifying user readiness:", err);
            setError("Failed to set user readiness");
        }

        const roomId = [user.id, matchedUser.userId].sort().join("_");
        router.push(`/collaboration?roomId=${roomId}`);
    };

    if (isMatching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <Header />
                <div className="min-h-screen flex flex-col items-center justify-center">
                    <Spinner size="lg" color="white" message="Finding a match..." />
                    <button
                        onClick={handleCancelMatching}
                        className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (matchedUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <Header />
                <div className="flex items-center justify-center pt-16">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-700">
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">Match Found!</h2>

                        <div className="flex flex-col items-center mb-6">
                            {matchedUser.picture ? (
                                <Image
                                    src={matchedUser.picture}
                                    alt={matchedUser.displayName || 'User'}
                                    width={96}
                                    height={96}
                                    className="rounded-full mb-4 border-4 border-green-500"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full mb-4 border-4 border-green-500 bg-gray-600 flex items-center justify-center">
                                    <span className="text-4xl text-white">
                                        {matchedUser.displayName?.[0]?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}

                            <h3 className="text-2xl font-semibold text-white mb-2">
                                {matchedUser.displayName || 'Anonymous User'}
                            </h3>

                            {matchedUser.email && (
                                <p className="text-gray-400 mb-4">{matchedUser.email}</p>
                            )}

                            <div className="w-full mt-6 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-gray-400 text-sm">Difficulty</p>
                                        <p className="text-white font-medium">{matchedUser.difficulty}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Topic</p>
                                        <p className="text-white font-medium">{matchedUser.topic}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Language</p>
                                        <p className="text-white font-medium">{matchedUser.language}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={handleJoinRoom}
                                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Join Room
                            </button>

                            <button
                                onClick={() => {
                                    clearMatchedUser();
                                    setError(null);
                                }}
                                className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Find Another Match
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <Header />
            <div className="flex items-center justify-center pt-16">
                <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-700">
                    <h1 className="text-3xl font-bold text-white mb-6 text-center">Find a Match</h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-white font-semibold mb-3">
                            Difficulty
                        </label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.values(Difficulty).map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-white font-semibold mb-3">
                            Topic
                        </label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.values(Topic).map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-white font-semibold mb-3">
                            Programming Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.values(Language).map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleStartMatching}
                        disabled={!user}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                        {user ? 'Start Matching' : 'Please Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
}