import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

let globalSocket: Socket | null = null;

export function getSocket(): Socket | null {
  if (!globalSocket) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return null;
    }

    globalSocket = io(`${SOCKET_URL}/realtime`, {
      transports: ["websocket"],
      reconnection: true,
      auth: {
        token,
      },
    });

    globalSocket.on("connect", () => {
      console.log("Socket connected");
    });

    globalSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    globalSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  return globalSocket;
}

export function useSocket(event: string, callback: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    // Get or create socket connection
    if (!socketRef.current) {
      socketRef.current = getSocket();
    }

    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    // Listen to event
    socket.on(event, callback);

    // Cleanup
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);

  return socketRef.current;
}
