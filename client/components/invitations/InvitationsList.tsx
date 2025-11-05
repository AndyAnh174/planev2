"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface InvitationsListProps {
  workspaceId: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  inviter: {
    id: string;
    username: string;
    email: string;
  };
}

export function InvitationsList({ workspaceId }: InvitationsListProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace-invitations", workspaceId],
    queryFn: async () => {
      const response = await api.get(`/workspaces/${workspaceId}/invitations`);
      return response.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-invitations", workspaceId] });
    },
  });

  const invitations: Invitation[] = data || [];

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
        Có lỗi xảy ra khi tải danh sách invitations.
      </div>
    );
  }

  const pendingInvitations = invitations.filter(
    (inv) => !inv.acceptedAt && !inv.rejectedAt && new Date(inv.expiresAt) > new Date()
  );
  const expiredInvitations = invitations.filter(
    (inv) => !inv.acceptedAt && !inv.rejectedAt && new Date(inv.expiresAt) <= new Date()
  );
  const acceptedInvitations = invitations.filter((inv) => inv.acceptedAt);
  const rejectedInvitations = invitations.filter((inv) => inv.rejectedAt);

  return (
    <div className="space-y-6">
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Pending Invitations</h3>
          <div className="space-y-2">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Role: {invitation.role} • Invited by {invitation.inviter.username} • Expires{" "}
                    {format(new Date(invitation.expiresAt), "MMM dd, yyyy")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelMutation.mutate(invitation.id)}
                  disabled={cancelMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiredInvitations.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Expired Invitations</h3>
          <div className="space-y-2">
            {expiredInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 opacity-60"
              >
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Role: {invitation.role} • Expired {format(new Date(invitation.expiresAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {acceptedInvitations.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Accepted Invitations</h3>
          <div className="space-y-2">
            {acceptedInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 opacity-60"
              >
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Accepted {format(new Date(invitation.acceptedAt!), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejectedInvitations.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Rejected Invitations</h3>
          <div className="space-y-2">
            {rejectedInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 opacity-60"
              >
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Rejected {format(new Date(invitation.rejectedAt!), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invitations.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Chưa có invitations nào.</p>
        </div>
      )}
    </div>
  );
}

