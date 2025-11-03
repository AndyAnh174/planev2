import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

interface RealtimeUser {
  id: string;
  username: string;
  avatarUrl?: string;
}

export function useRealtime(pageId: string) {
  const [users, setUsers] = useState<RealtimeUser[]>([]);

  useSocket(`page:${pageId}:users`, (data: { users: RealtimeUser[] }) => {
    setUsers(data.users);
  });

  useSocket(`page:${pageId}:user-joined`, (data: { user: RealtimeUser }) => {
    setUsers((prev) => [...prev, data.user]);
  });

  useSocket(`page:${pageId}:user-left`, (data: { userId: string }) => {
    setUsers((prev) => prev.filter((u) => u.id !== data.userId));
  });

  return { users };
}

