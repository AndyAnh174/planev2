"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AIPanelProps {
  pageId?: string;
}

export function AIPanel({ pageId }: AIPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement AI summarize API call
      console.log("Summarize page:", pageId);
    } catch (error) {
      console.error("AI summarize error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrainstorm = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement AI brainstorm API call
      console.log("Brainstorm ideas");
    } catch (error) {
      console.error("AI brainstorm error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">AI Assistant</h3>
      <div className="space-y-4">
        <Button
          onClick={handleSummarize}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Đang xử lý..." : "Tóm tắt nội dung"}
        </Button>
        <Button
          onClick={handleBrainstorm}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? "Đang xử lý..." : "Sinh ý tưởng"}
        </Button>
        <div>
          <input
            type="text"
            placeholder="Hỏi về nội dung..."
            className="w-full rounded-md border border-border px-3 py-2"
          />
          <Button className="mt-2 w-full" disabled={isLoading}>
            Hỏi AI
          </Button>
        </div>
      </div>
    </div>
  );
}

