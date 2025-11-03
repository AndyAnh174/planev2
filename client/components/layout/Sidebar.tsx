"use client";

import { useWorkspaceStore } from "@/store/workspaceStore";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import { SearchBar } from "@/components/shared/SearchBar";
import { Plus, FileText, LayoutGrid, Trash2 } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  const { workspaces, currentWorkspace } = useWorkspaceStore();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="p-4 space-y-4">
        <WorkspaceSelector />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-1" />
            Trang mới
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <LayoutGrid className="h-4 w-4 mr-1" />
            Board
          </Button>
        </div>
        <SearchBar placeholder="Tìm kiếm..." />
      </div>
      {currentWorkspace && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <nav className="space-y-1">
            <div className="px-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Pages
            </div>
            <div className="space-y-1">
              {/* TODO: Load pages from API */}
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Chưa có trang nào
              </div>
            </div>
          </nav>
          <nav className="space-y-1">
            <div className="px-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Boards
            </div>
            <div className="space-y-1">
              {/* TODO: Load boards from API */}
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Chưa có board nào
              </div>
            </div>
          </nav>
        </div>
      )}
      <div className="border-t border-sidebar-border p-4">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          <Trash2 className="h-4 w-4 mr-2" />
          Thùng rác
        </Button>
      </div>
    </aside>
  );
}

