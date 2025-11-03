"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h2>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        {error.message || "Có lỗi không mong muốn xảy ra"}
      </p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}

