"use client";

import Link from "next/link";
import { UserStatusBadge } from "./UserStatusBadge";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  role?: string;
  status?: "active" | "inactive" | "pending";
  workspaceId: string;
}

export function UserCard({ user, role, status = "active", workspaceId }: UserCardProps) {
  return (
    <Link
      href={`/workspace/${workspaceId}/users/${user.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{user.username}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {role && (
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
              {role}
            </span>
          )}
          <UserStatusBadge status={status} />
        </div>
      </div>
    </Link>
  );
}

