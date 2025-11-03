import { z } from "zod";

export const createPageSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(500),
  slug: z.string().optional(),
  visibility: z.enum(["private", "workspace", "public"]).optional(),
  workspaceId: z.string().uuid("Workspace ID không hợp lệ"),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().optional(),
  visibility: z.enum(["private", "workspace", "public"]).optional(),
  isIndexed: z.boolean().optional(),
});

export type CreatePageForm = z.infer<typeof createPageSchema>;
export type UpdatePageForm = z.infer<typeof updatePageSchema>;

