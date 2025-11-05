import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";
import { getSocket } from "./useSocket";

export interface RealtimeUser {
  userId: string;
  username: string;
  avatarUrl?: string;
  email: string;
  isTyping?: boolean;
}

export function useRealtime(pageId: string) {
  const [users, setUsers] = useState<RealtimeUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<RealtimeUser[]>([]);

  const socket = getSocket();

  // Join page when component mounts
  useEffect(() => {
    if (!socket || !pageId) return;

    socket.emit("page:join", { pageId });

    return () => {
      socket.emit("page:leave", { pageId });
    };
  }, [socket, pageId]);

  // Listen to user:joined event
  useSocket("user:joined", (data: { userId: string; user: RealtimeUser; users: RealtimeUser[] }) => {
    setUsers(data.users);
  });

  // Listen to user:left event
  useSocket("user:left", (data: { userId: string; users: RealtimeUser[] }) => {
    setUsers(data.users);
  });

  // Listen to user:typing event
  useSocket("user:typing", (data: { userId: string; users: RealtimeUser[] }) => {
    setTypingUsers(data.users);
  });

  return { users, typingUsers };
}
