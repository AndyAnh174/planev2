"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { UserList } from "@/components/users/UserList";
import { InvitationsList } from "@/components/invitations/InvitationsList";
import { InviteDialog } from "@/components/invitations/InviteDialog";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-6">
        <Breadcrumb
          items={[
            { label: "Workspaces", href: `/workspace/${workspaceId}` },
            { label: "Users", href: `/workspace/${workspaceId}/users` },
          ]}
        />
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workspace Members</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInvitations(!showInvitations)}
            >
              {showInvitations ? "Hide Invitations" : "Show Invitations"}
            </Button>
            <Button onClick={() => setInviteDialogOpen(true)}>
              Invite User
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {showInvitations ? (
          <InvitationsList workspaceId={workspaceId} />
        ) : (
          <UserList workspaceId={workspaceId} />
        )}
      </div>
      <InviteDialog
        workspaceId={workspaceId}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}

