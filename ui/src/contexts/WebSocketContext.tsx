"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface WebSocketContextValue {
  ws: WebSocket | null;
  sendMessage: (message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  ws: null,
  sendMessage: () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3002";
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("[WebSocketContext] Connected to", url);
    };

    socket.onclose = () => {
      console.log("[WebSocketContext] Connection closed");
    };

    socket.onerror = (err) => {
      console.error("[WebSocketContext] WebSocket error", err);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = (message: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
