"use client";

import { useRealtime } from "@/hooks/useRealtime";

interface PresenceIndicatorProps {
  pageId: string;
}

export function PresenceIndicator({ pageId }: PresenceIndicatorProps) {
  const { users } = useRealtime(pageId);

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="flex -space-x-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs ring-2 ring-background"
          title={user.username}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-full w-full rounded-full"
            />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
      ))}
    </div>
  );
}

