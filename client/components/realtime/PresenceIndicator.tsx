"use client";

import { useRealtime } from "@/hooks/useRealtime";

interface PresenceIndicatorProps {
  pageId: string;
}

export function PresenceIndicator({ pageId }: PresenceIndicatorProps) {
  const { users, typingUsers } = useRealtime(pageId);

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {users.map((user) => (
          <div
            key={user.userId}
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs ring-2 ring-background"
            title={user.username}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{user.username.charAt(0).toUpperCase()}</span>
            )}
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
        ))}
      </div>
      {typingUsers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {typingUsers.length === 1
            ? `${typingUsers[0].username} đang gõ...`
            : `${typingUsers.length} người đang gõ...`}
        </div>
      )}
    </div>
  );
}
