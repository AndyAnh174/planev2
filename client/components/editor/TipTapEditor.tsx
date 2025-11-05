"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { getSocket } from "@/hooks/useSocket";

interface TipTapEditorProps {
  pageId: string;
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

export function TipTapEditor({
  pageId,
  initialContent = "",
  onChange,
  readOnly = false,
}: TipTapEditorProps) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // History is enabled by default in StarterKit
      }),
      Placeholder.configure({
        placeholder: readOnly ? "" : "Bắt đầu viết... Nhấn / để xem các lệnh",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg",
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange && !readOnly) {
        onChange(editor.getHTML());
      }
    },
  });

  // Handle typing indicators
  useEffect(() => {
    if (!editor || readOnly) return;

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      // Emit typing start
      socket.emit("typing:start", { pageId });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing stop after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { pageId });
      }, 2000);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Emit typing stop on cleanup
      socket.emit("typing:stop", { pageId });
    };
  }, [editor, pageId, readOnly]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Đang tải editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] w-full max-w-4xl mx-auto py-8 px-4">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

