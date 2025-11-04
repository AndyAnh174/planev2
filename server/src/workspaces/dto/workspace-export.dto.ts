/**
 * DTOs for Workspace Export
 * These interfaces define the structure of exported workspace data
 */

export interface BlockExportData {
  id: string;
  type: string;
  content: Record<string, any>;
  orderIndex: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageExportData {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  authorId: string;
  author?: {
    id: string;
    username?: string;
    email?: string;
  };
  isIndexed: boolean;
  blocks: BlockExportData[];
  createdAt: string;
  updatedAt: string;
}

export interface CardExportData {
  id: string;
  title: string;
  description?: string;
  status: string;
  orderIndex: number;
  assigneeId?: string;
  assignee?: {
    id: string;
    username?: string;
    email?: string;
  };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardExportData {
  id: string;
  name: string;
  description?: string;
  cards: CardExportData[];
  createdAt: string;
  updatedAt: string;
}

export interface FileExportData {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  minioPath: string;
  uploaderId: string;
  uploader?: {
    id: string;
    username?: string;
    email?: string;
  };
  binary?: string; // Base64 encoded file content
  createdAt: string;
}

export interface WorkspaceMemberExportData {
  userId: string;
  role: string;
  user?: {
    id: string;
    username?: string;
    email?: string;
  };
  joinedAt: string;
}

export interface WorkspaceExportData {
  workspace: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    avatarUrl?: string;
    ownerId: string;
    owner?: {
      id: string;
      username?: string;
      email?: string;
    };
    members: WorkspaceMemberExportData[];
    createdAt: string;
    updatedAt: string;
  };
  pages: PageExportData[];
  boards: BoardExportData[];
  files: FileExportData[];
  exportedAt: string;
  exportedBy: string;
}

