"use client";

import { WebSocketProvider } from "@/contexts/WebSocketContext";

export default function MatchingLayout({ children }: { children: React.ReactNode }) {
  return <WebSocketProvider>{children}</WebSocketProvider>;
}
