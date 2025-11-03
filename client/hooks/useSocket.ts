import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

export function useSocket(event: string, callback: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
      });
    }

    const socket = socketRef.current;

    // Listen to event
    socket.on(event, callback);

    // Cleanup
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);

  return socketRef.current;
}

