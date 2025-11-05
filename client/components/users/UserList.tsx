"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserCard } from "./UserCard";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface UserListProps {
  workspaceId: string;
}

interface WorkspaceMember {
  userId: string;
  role: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
}

export function UserList({ workspaceId }: UserListProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace-members", workspaceId, search, page],
    queryFn: async () => {
      const response = await api.get(`/workspaces/${workspaceId}/members`, {
        params: {
          search: search || undefined,
          limit,
          offset: (page - 1) * limit,
        },
      });
      return response.data;
    },
  });

  const members: WorkspaceMember[] = data?.members || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        Có lỗi xảy ra khi tải danh sách users.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page when searching
          }}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {search ? "Không tìm thấy user nào." : "Chưa có members trong workspace này."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <UserCard
                key={member.userId}
                user={member.user}
                role={member.role}
                status="active"
                workspaceId={workspaceId}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page} / {totalPages} ({total} users)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

