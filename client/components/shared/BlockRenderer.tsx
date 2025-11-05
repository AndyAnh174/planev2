"use client";

import React from "react";
import { Block, BlockType } from "@/types/page.types";
import { cn } from "@/lib/utils";

interface BlockRendererProps {
  blocks: Block[];
  readOnly?: boolean;
}

export function BlockRenderer({ blocks, readOnly = true }: BlockRendererProps) {
  // Sort blocks by orderIndex
  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

  // Group blocks by parentId for nested structure
  const rootBlocks = sortedBlocks.filter((block) => !block.parentId);
  const childBlocksMap = new Map<string, Block[]>();
  
  sortedBlocks.forEach((block) => {
    if (block.parentId) {
      if (!childBlocksMap.has(block.parentId)) {
        childBlocksMap.set(block.parentId, []);
      }
      childBlocksMap.get(block.parentId)!.push(block);
    }
  });

  const renderBlock = (block: Block, depth: number = 0) => {
    const children = childBlocksMap.get(block.id) || [];
    const childBlocks = children.sort((a, b) => a.orderIndex - b.orderIndex);

    switch (block.type) {
      case "text":
        return (
          <div
            key={block.id}
            className={cn("mb-4", depth > 0 && "ml-8")}
            dangerouslySetInnerHTML={{
              __html: block.content?.text || block.content?.html || "",
            }}
          />
        );

      case "heading":
        const level = Number(block.content?.level) || 1;
        const headingLevel = Math.min(Math.max(level, 1), 6);
        const headingClass = cn(
          "mb-4 font-bold",
          level === 1 && "text-3xl",
          level === 2 && "text-2xl",
          level === 3 && "text-xl",
          depth > 0 && "ml-8"
        );
        const headingProps = {
          key: block.id,
          className: headingClass,
        };
        const headingContent = block.content?.text || "";
        
        if (headingLevel === 1) return <h1 {...headingProps}>{headingContent}</h1>;
        if (headingLevel === 2) return <h2 {...headingProps}>{headingContent}</h2>;
        if (headingLevel === 3) return <h3 {...headingProps}>{headingContent}</h3>;
        if (headingLevel === 4) return <h4 {...headingProps}>{headingContent}</h4>;
        if (headingLevel === 5) return <h5 {...headingProps}>{headingContent}</h5>;
        return <h6 {...headingProps}>{headingContent}</h6>;

      case "code":
        return (
          <div key={block.id} className={cn("mb-4", depth > 0 && "ml-8")}>
            <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <code className={block.content?.language ? `language-${block.content.language}` : ""}>
                {block.content?.code || ""}
              </code>
            </pre>
          </div>
        );

      case "table":
        const rows = block.content?.rows || [];
        return (
          <div key={block.id} className={cn("mb-4 overflow-x-auto", depth > 0 && "ml-8")}>
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
              <tbody>
                {rows.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 px-4 py-2 dark:border-gray-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "checklist":
        const items = block.content?.items || [];
        return (
          <div key={block.id} className={cn("mb-4", depth > 0 && "ml-8")}>
            <ul className="list-none space-y-2">
              {items.map((item: { checked?: boolean; text?: string }, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    disabled
                    className="mt-1"
                  />
                  <span>{item.text || ""}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "image":
        return (
          <div key={block.id} className={cn("mb-4", depth > 0 && "ml-8")}>
            <img
              src={block.content?.url || block.content?.src || ""}
              alt={block.content?.alt || ""}
              className="max-w-full rounded-lg"
            />
          </div>
        );

      case "embed":
        return (
          <div key={block.id} className={cn("mb-4", depth > 0 && "ml-8")}>
            <div
              className="aspect-video w-full"
              dangerouslySetInnerHTML={{
                __html: block.content?.html || block.content?.embed || "",
              }}
            />
          </div>
        );

      case "quote":
        return (
          <blockquote
            key={block.id}
            className={cn(
              "mb-4 border-l-4 border-gray-300 pl-4 italic dark:border-gray-700",
              depth > 0 && "ml-8"
            )}
          >
            {block.content?.text || block.content?.quote || ""}
          </blockquote>
        );

      case "divider":
        return (
          <hr
            key={block.id}
            className={cn("my-6 border-gray-300 dark:border-gray-700", depth > 0 && "ml-8")}
          />
        );

      default:
        return (
          <div key={block.id} className={cn("mb-4", depth > 0 && "ml-8")}>
            <pre className="text-sm text-muted-foreground">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      {rootBlocks.map((block) => (
        <div key={block.id}>
          {renderBlock(block)}
          {childBlocksMap.get(block.id)?.map((childBlock) => renderBlock(childBlock, 1))}
        </div>
      ))}
    </div>
  );
}

