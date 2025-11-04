export type PageVisibility = "private" | "workspace" | "public";

export type BlockType =
  | "text"
  | "heading"
  | "code"
  | "table"
  | "checklist"
  | "image"
  | "embed"
  | "quote"
  | "divider";

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

export interface Page {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  visibility: PageVisibility;
  authorId: string;
  author?: User;
  isIndexed: boolean;
  blocks?: Block[];
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  id: string;
  pageId: string;
  type: BlockType;
  content: Record<string, any>;
  orderIndex: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageDto {
  title: string;
  slug?: string;
  visibility?: PageVisibility;
  workspaceId: string;
}

export interface UpdatePageDto {
  title?: string;
  slug?: string;
  visibility?: PageVisibility;
  isIndexed?: boolean;
}

export interface CreateBlockDto {
  type: BlockType;
  content: Record<string, any>;
  orderIndex: number;
  parentId?: string;
}

export interface UpdateBlockDto {
  content?: Record<string, any>;
  orderIndex?: number;
}

