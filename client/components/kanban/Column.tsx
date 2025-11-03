"use client";

import { Card } from "./Card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ColumnProps {
  id: string;
  title: string;
  cards: Array<{
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
  }>;
  onAddCard?: () => void;
  onCardClick?: (cardId: string) => void;
}

export function Column({
  id,
  title,
  cards,
  onAddCard,
  onCardClick,
}: ColumnProps) {
  return (
    <div className="flex-shrink-0 w-64">
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground">{cards.length}</span>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {cards.map((card) => (
            <Card
              key={card.id}
              {...card}
              onClick={() => onCardClick?.(card.id)}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={onAddCard}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm card
          </Button>
        </div>
      </div>
    </div>
  );
}

