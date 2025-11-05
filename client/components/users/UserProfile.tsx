"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { UserStatusBadge } from "./UserStatusBadge";
import { Button } from "@/components/ui/button";

interface UserProfileProps {
  userId: string;
  workspaceId: string;
}

export function UserProfile({ userId, workspaceId }: UserProfileProps) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },
  });

  const { data: memberData } = useQuery({
    queryKey: ["workspace-member", workspaceId, userId],
    queryFn: async () => {
      const response = await api.get(`/workspaces/${workspaceId}/members`);
      const members = response.data.members || [];
      interface Member {
        userId: string;
        role?: string;
        [key: string]: unknown;
      }
      return members.find((m: Member) => m.userId === userId);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        Không tìm thấy user hoặc có lỗi xảy ra.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-4 flex items-center gap-4">
            {memberData?.role && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {memberData.role}
              </span>
            )}
            <UserStatusBadge status="active" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Thông tin</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Username</dt>
            <dd className="mt-1 text-sm">{user.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
            <dd className="mt-1 text-sm">{user.email}</dd>
          </div>
          {memberData && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Role trong workspace</dt>
              <dd className="mt-1 text-sm capitalize">{memberData.role}</dd>
            </div>
          )}
          {memberData?.joinedAt && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Tham gia từ</dt>
              <dd className="mt-1 text-sm">
                {new Date(memberData.joinedAt).toLocaleDateString()}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

