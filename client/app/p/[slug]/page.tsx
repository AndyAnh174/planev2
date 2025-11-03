"use client";

import { useParams } from "next/navigation";

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold">Public Page</h1>
        <p className="text-muted-foreground">Slug: {slug}</p>
        <div className="mt-6">
          {/* TODO: Render page content in read-only mode */}
          <p>Nội dung trang sẽ được hiển thị ở đây (chế độ chỉ đọc)</p>
        </div>
      </div>
    </div>
  );
}

