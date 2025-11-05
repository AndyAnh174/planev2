"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PresenceIndicator } from "@/components/realtime/PresenceIndicator";
import { PageSettings } from "@/components/pages/PageSettings";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function PageEditor() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const pageId = params.pageId as string;
  const [showSettings, setShowSettings] = useState(false);

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
          <div className="flex items-center gap-2">
            <PresenceIndicator pageId={pageId} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <TipTapEditor pageId={pageId} />
        </div>
        {showSettings && (
          <div className="w-80 border-l border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Page Settings</h2>
            <PageSettings pageId={pageId} workspaceId={workspaceId} />
          </div>
        )}
      </div>
    </div>
  );
}

