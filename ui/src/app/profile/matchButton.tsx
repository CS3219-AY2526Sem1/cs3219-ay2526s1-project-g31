"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MatchButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartMatching = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/match/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user123",     // TODO: replace with actual logged-in user ID
          difficulty: "easy",    // TODO: replace with user-selected difficulty
        }),
      });

      if (!res.ok) throw new Error("Failed to start matching");
      router.push("/matching");
    } catch (err) {
      console.error("Start matching failed:", err);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartMatching}
      disabled={isLoading}
      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xl font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
    >
      {isLoading ? "Starting..." : "🤝 Start Matching with Peers"}
    </button>
  );
}
