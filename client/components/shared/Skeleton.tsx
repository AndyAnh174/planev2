"use client";

import { Skeleton as UISkeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <UISkeleton className="h-12 w-3/4" />
      <UISkeleton className="h-4 w-full" />
      <UISkeleton className="h-4 w-5/6" />
      <UISkeleton className="h-32 w-full" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <UISkeleton className="h-4 w-3/4" />
      <UISkeleton className="h-3 w-full" />
      <UISkeleton className="h-3 w-2/3" />
    </div>
  );
}

