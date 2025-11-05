"use client";

import { useRealtime, RealtimeUser } from "@/hooks/useRealtime";

interface TypingIndicatorProps {
  pageId: string;
}

export function TypingIndicator({ pageId }: TypingIndicatorProps) {
  const { typingUsers } = useRealtime(pageId);

  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground">
      {typingUsers.length === 1 ? (
        <span>
          <strong>{typingUsers[0].username}</strong> đang gõ...
        </span>
      ) : (
        <span>{typingUsers.length} người đang gõ...</span>
      )}
    </div>
  );
}

