import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Tên workspace không được để trống").max(255),
  description: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceForm = z.infer<typeof updateWorkspaceSchema>;

