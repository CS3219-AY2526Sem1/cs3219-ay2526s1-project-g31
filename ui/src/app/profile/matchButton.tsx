"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MatchButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleStartMatching = async () => {
    setIsLoading(true);

    if (!user) {
      console.error("User not logged in");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MATCHING_SERVICE_BASE_URL}/api/match/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
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
