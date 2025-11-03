"use client";

import { useParams } from "next/navigation";
import { BoardView } from "@/components/kanban/BoardView";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function BoardPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-6">
        <Breadcrumb
          items={[
            { label: "Workspaces", href: `/workspace/${workspaceId}` },
            { label: "Boards", href: `/workspace/${workspaceId}/boards` },
            { label: `Board ${boardId}` },
          ]}
        />
        <h1 className="mt-4 text-2xl font-bold">Kanban Board</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <BoardView boardId={boardId} />
      </div>
    </div>
  );
}

