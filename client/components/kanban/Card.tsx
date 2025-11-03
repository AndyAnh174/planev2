"use client";

import { Card as UICard } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CardProps {
  id: string;
  title: string;
  description?: string;
  assignee?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  dueDate?: string;
  labels?: string[];
  onClick?: () => void;
}

export function Card({
  id,
  title,
  description,
  assignee,
  dueDate,
  labels,
  onClick,
}: CardProps) {
  return (
    <UICard
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      {description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>
      )}
      {labels && labels.length > 0 && (
        <div className="flex gap-1 mb-2 flex-wrap">
          {labels.map((label, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        {assignee && (
          <UserAvatar
            src={assignee.avatarUrl}
            name={assignee.username}
            className="h-6 w-6"
          />
        )}
        {dueDate && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(dueDate), "dd/MM", { locale: vi })}
          </span>
        )}
      </div>
    </UICard>
  );
}

