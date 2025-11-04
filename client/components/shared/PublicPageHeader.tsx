"use client";

import { format } from "date-fns";
import { UserAvatar } from "./UserAvatar";
import { ShareButton } from "./ShareButton";
import { User } from "@/types/page.types";

interface PublicPageHeaderProps {
  title: string;
  author?: User;
  updatedAt: string;
  slug: string;
}

export function PublicPageHeader({ title, author, updatedAt, slug }: PublicPageHeaderProps) {
  const formattedDate = format(new Date(updatedAt), "d MMMM yyyy");

  return (
    <header className="mb-8 border-b border-border pb-6">
      <h1 className="mb-4 text-4xl font-bold">{title}</h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {author && (
            <>
              <UserAvatar
                src={author.avatarUrl}
                name={author.username}
                alt={author.username}
              />
              <div>
                <div className="text-sm font-medium">{author.username}</div>
                <div className="text-xs text-muted-foreground">Cập nhật {formattedDate}</div>
              </div>
            </>
          )}
        </div>
        <ShareButton slug={slug} pageTitle={title} />
      </div>
    </header>
  );
}

