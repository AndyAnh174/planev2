"use client";

import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Workspaces" },
          { label: `Workspace ${workspaceId}` },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold">Workspace Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Workspace ID: {workspaceId}
      </p>
    </div>
  );
}

