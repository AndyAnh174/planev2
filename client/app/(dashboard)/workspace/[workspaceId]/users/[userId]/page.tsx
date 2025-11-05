"use client";

import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { UserProfile } from "@/components/users/UserProfile";
import { Button } from "@/components/ui/button";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const userId = params.userId as string;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-6">
        <Breadcrumb
          items={[
            { label: "Workspaces", href: `/workspace/${workspaceId}` },
            { label: "Users", href: `/workspace/${workspaceId}/users` },
            { label: "User Profile" },
          ]}
        />
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <Button
            variant="outline"
            onClick={() => router.push(`/workspace/${workspaceId}/users`)}
          >
            Quay lại
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <UserProfile userId={userId} workspaceId={workspaceId} />
      </div>
    </div>
  );
}

