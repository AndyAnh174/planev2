"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable some features in read-only mode
        history: !readOnly,
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

