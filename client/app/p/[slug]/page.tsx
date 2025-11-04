"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { pagesApi } from "@/lib/api";
import { Page } from "@/types/page.types";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { BlockRenderer } from "@/components/shared/BlockRenderer";
import { PageSkeleton } from "@/components/shared/Skeleton";
import { AlertCircle } from "lucide-react";

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    data: page,
    isLoading,
    isError,
    error,
  } = useQuery<Page>({
    queryKey: ["public-page", slug],
    queryFn: () => pagesApi.getPublicPage(slug),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <PageSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !page) {
    const errorMessage =
      (error as any)?.response?.status === 404
        ? "Trang không tìm thấy"
        : "Đã xảy ra lỗi khi tải trang";

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-2xl font-semibold">Không tìm thấy trang</h2>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <article className="mx-auto max-w-4xl px-6 py-12">
        <PublicPageHeader
          title={page.title}
          author={page.author}
          updatedAt={page.updatedAt}
          slug={page.slug}
        />
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {page.blocks && page.blocks.length > 0 ? (
            <BlockRenderer blocks={page.blocks} readOnly={true} />
          ) : (
            <p className="text-muted-foreground">Trang này chưa có nội dung.</p>
          )}
        </div>
      </article>
    </div>
  );
}

