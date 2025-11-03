"use client";

import { useParams } from "next/navigation";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PresenceIndicator } from "@/components/realtime/PresenceIndicator";

export default function PageEditor() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const pageId = params.pageId as string;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-6">
        <Breadcrumb
          items={[
            { label: "Workspaces", href: `/workspace/${workspaceId}` },
            { label: "Pages", href: `/workspace/${workspaceId}/pages` },
            { label: `Page ${pageId}` },
          ]}
        />
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Page Editor</h1>
          <PresenceIndicator pageId={pageId} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <TipTapEditor pageId={pageId} />
      </div>
    </div>
  );
}

