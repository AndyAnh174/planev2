"use client";

import { useState, useEffect } from "react";
import { Column } from "./Column";
import api from "@/lib/api";

interface BoardViewProps {
  boardId: string;
}

interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  assignee?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  dueDate?: string;
  labels?: string[];
}

export function BoardView({ boardId }: BoardViewProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch cards from API
    setIsLoading(false);
  }, [boardId]);

  const columns = [
    { id: "todo", title: "Todo" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  if (isLoading) {
    return <div>Đang tải board...</div>;
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnCards = cards.filter((card) => card.columnId === column.id);
        return (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            cards={columnCards}
            onAddCard={() => {
              // TODO: Implement add card
            }}
            onCardClick={(cardId) => {
              // TODO: Open card dialog
            }}
          />
        );
      })}
    </div>
  );
}

