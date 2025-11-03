import { create } from "zustand";
import { Block } from "@/types/page.types";

interface EditorState {
  currentPageId: string | null;
  blocks: Block[];
  isLoading: boolean;
  isSaving: boolean;
  setCurrentPage: (pageId: string | null) => void;
  setBlocks: (blocks: Block[]) => void;
  addBlock: (block: Block) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (blockIds: string[]) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentPageId: null,
  blocks: [],
  isLoading: false,
  isSaving: false,
  setCurrentPage: (pageId) => set({ currentPageId: pageId, blocks: [] }),
  setBlocks: (blocks) => set({ blocks }),
  addBlock: (block) =>
    set((state) => ({ blocks: [...state.blocks, block] })),
  updateBlock: (blockId, updates) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    })),
  removeBlock: (blockId) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== blockId),
    })),
  reorderBlocks: (blockIds) =>
    set((state) => ({
      blocks: blockIds
        .map((id) => state.blocks.find((b) => b.id === id))
        .filter((b): b is Block => b !== undefined),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setSaving: (isSaving) => set({ isSaving }),
}));

