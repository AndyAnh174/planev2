"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

interface PageSettingsProps {
  pageId: string;
  workspaceId: string;
}

export function PageSettings({ pageId, workspaceId }: PageSettingsProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: page, isLoading } = useQuery({
    queryKey: ["page", pageId],
    queryFn: async () => {
      const response = await api.get(`/pages/${pageId}`);
      return response.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (data: { slug?: string; isIndexed: boolean }) => {
      const response = await api.post(`/pages/${pageId}/publish`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/pages/${pageId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
    },
  });

  const seoMutation = useMutation({
    mutationFn: async (isIndexed: boolean) => {
      await api.patch(`/pages/${pageId}/seo`, { isIndexed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
    },
  });

  if (isLoading || !page) {
    return null;
  }

  const isPublic = page.visibility === "public";
  const isIndexed = page.isIndexed || false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Visibility</h3>
          <p className="text-sm text-muted-foreground">
            {isPublic ? "Page is public" : "Page is private"}
          </p>
        </div>
        {isPublic ? (
          <Button
            variant="outline"
            onClick={() => unpublishMutation.mutate()}
            disabled={unpublishMutation.isPending}
          >
            {unpublishMutation.isPending ? "Unpublishing..." : "Unpublish"}
          </Button>
        ) : (
          <Button
            onClick={() => publishMutation.mutate({ isIndexed: false })}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? "Publishing..." : "Publish"}
          </Button>
        )}
      </div>

      {isPublic && (
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Search Engine Indexing</h3>
              <p className="text-sm text-muted-foreground">
                Allow search engines to index this page
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isIndexed}
                onChange={(e) => seoMutation.mutate(e.target.checked)}
                disabled={seoMutation.isPending}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
            </label>
          </div>
          {isIndexed && (
            <p className="text-xs text-muted-foreground">
              This page will appear in search results and sitemap.xml
            </p>
          )}
        </div>
      )}

      {isPublic && page.slug && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 font-semibold">Public URL</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-muted px-2 py-1 text-sm">
              {typeof window !== "undefined" && `${window.location.origin}/p/${page.slug}`}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(`${window.location.origin}/p/${page.slug}`);
                }
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

