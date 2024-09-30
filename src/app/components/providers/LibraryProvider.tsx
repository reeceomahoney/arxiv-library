"use client";

import type { Folder, Paper } from "~/server/db/schema";
import { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { moveFolder, movePapers, deleteFolders } from "~/server/actions";

// Extend the Folder type to include UI state
export type FolderUI = Folder & {
  isOpen: boolean;
  isSelected: boolean;
  isRenaming: boolean;
  folders: FolderUI[];
};

interface LibraryProps {
  folders: FolderUI[];
  papers: Paper[];
}

interface LibraryState extends LibraryProps {
  selectedPapers: number[];
  openPapers: Paper[];
  activeTab: string;
  setFolders: (folders: FolderUI[]) => void;
  addFolders: (folders: FolderUI[]) => void;
  setPapers: (papers: Paper[]) => void;
  addPapers: (papers: Paper[]) => void;
  setSelectedPapers: (selectedPapers: number[]) => void;
  addSelectedPaper: (paperId: number) => void;
  setOpenPapers: (openPapers: Paper[]) => void;
  addOpenPaper: (paper: Paper) => void;
  setActiveTab: (activeTab: string) => void;
  toggleFolderOpen: (id: number) => void;
  selectFolder: (id: number) => void;
  setFolderRenaming: (folderId: number, isRenaming: boolean) => void;
  setFolderName: (folderId: number, name: string) => void;
  deleteFolders: (folderIds: number[]) => Promise<void>;
  moveFolder: (itemId: number, folderId: number) => Promise<void>;
  dragPapers: (itemId: number, folderId: number) => Promise<void>;
}

type LibraryStore = ReturnType<typeof createLibraryStore>;
type LibraryProviderProps = React.PropsWithChildren<LibraryProps>;

const createLibraryStore = (initProps?: Partial<LibraryProps>) => {
  const DEFAULT_PROPS: LibraryProps = {
    folders: [],
    papers: [],
  };

  // Set "All Papers" folder as selected by default
  const initialFolders = initProps?.folders ?? DEFAULT_PROPS.folders;
  const foldersWithAllPapersSelected = initialFolders.map(folder => ({
    ...folder,
    isSelected: folder.name === "All Papers"
  }));

  return createStore<LibraryState>((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    folders: foldersWithAllPapersSelected,
    selectedPapers: [],
    openPapers: [],
    activeTab: "my-library",
    setFolders: (folders) => set({ folders }),
    addFolders: (folders) => set({ folders: folders.concat(folders) }),
    setPapers: (papers) => set({ papers }),
    addPapers: (papers) => set({ papers: papers.concat(papers) }),
    setSelectedPapers: (selectedPapers) => set({ selectedPapers }),
    addSelectedPaper: (paperId) =>
      set((state) => ({
        selectedPapers: state.selectedPapers.includes(paperId)
          ? state.selectedPapers.filter((id) => id !== paperId)
          : [...state.selectedPapers, paperId],
      })),
    setOpenPapers: (openPapers) => set({ openPapers }),
    addOpenPaper: (paper) =>
      set((state) => ({
        openPapers: state.openPapers.includes(paper)
          ? state.openPapers
          : [...state.openPapers, paper],
      })),
    setActiveTab: (activeTab) => set({ activeTab }),
    toggleFolderOpen: (id) =>
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === id ? { ...folder, isOpen: !folder.isOpen } : folder,
        ),
      })),
    selectFolder: (id) =>
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === id
            ? { ...folder, isSelected: true }
            : { ...folder, isSelected: false },
        ),
      })),
    setFolderRenaming: (folderId, isRenaming) =>
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === folderId ? { ...folder, isRenaming } : folder,
        ),
      })),
    setFolderName: (folderId, name) =>
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === folderId ? { ...folder, name } : folder,
        ),
      })),
    deleteFolders: async (folderIds) => {
      await deleteFolders(folderIds);
      set((state) => ({
        folders: state.folders.filter(
          (folder) =>
            !folderIds.includes(folder.id) &&
            !folderIds.includes(folder.parentFolderId),
        ),
      }));
    },
    moveFolder: async (itemId, folderId) => {
      if (itemId === folderId) return;
      await moveFolder(itemId, folderId);
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === itemId
            ? { ...folder, parentFolderId: folderId }
            : folder,
        ),
      }));
    },
    dragPapers: async (itemId, folderId) => {
      // Add the current paper to selected papers if it's not already there
      const draggedPapers = get().selectedPapers.includes(itemId)
        ? get().selectedPapers
        : [...get().selectedPapers, itemId];

      await movePapers(draggedPapers, folderId);
      set((state) => ({
        papers: state.papers.map((paper) =>
          draggedPapers.includes(paper.id)
            ? { ...paper, folderId: folderId }
            : paper,
        ),
      }));
    },
  }));
};

const LibraryContext = createContext<LibraryStore | null>(null);

export function LibraryProvider({ children, ...props }: LibraryProviderProps) {
  const storeRef = useRef<LibraryStore>();
  if (!storeRef.current) {
    storeRef.current = createLibraryStore(props);
  }

  return (
    <LibraryContext.Provider value={storeRef.current}>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </LibraryContext.Provider>
  );
}

export function useLibraryContext<T>(selector: (state: LibraryState) => T): T {
  const store = useContext(LibraryContext);
  if (!store) throw new Error("Missing BearContext.Provider in the tree");
  return useStore(store, selector);
}
