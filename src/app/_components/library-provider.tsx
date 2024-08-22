"use client";

import React, {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { Folder, Paper } from "~/server/db/schema";

// Extend the Folder type to include UI state
export type FolderUI = Folder & {
  isOpen: boolean;
  isSelected: boolean;
  isRenaming: boolean;
  folders: FolderUI[];
};

// Define the context type
type LibraryContextType = {
  folders: FolderUI[];
  setFolders: Dispatch<SetStateAction<FolderUI[]>>;
  papers: Paper[];
  selectedPapers: number[];
  setSelectedPapers: Dispatch<SetStateAction<number[]>>;
  setPapers: Dispatch<SetStateAction<Paper[]>>;
  toggleFolderOpen: (id: number) => void;
  selectFolder: (id: number) => void;
  setFolderRenaming: (folderId: number, isRenaming: boolean) => void;
  setFolderName: (folderId: number, name: string) => void;
  openPapers: Paper[];
  setOpenPapers: Dispatch<SetStateAction<Paper[]>>;
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Define the provider
type LibraryProviderProps = {
  children: ReactNode;
  initialFolders: Folder[];
  initialPapers: Paper[];
};

export const LibraryProvider: React.FC<LibraryProviderProps> = ({
  children,
  initialFolders,
  initialPapers,
}) => {
  const [folders, setFolders] = useState<FolderUI[]>(
    initialFolders.map((folder) => ({
      ...folder,
      isOpen: false,
      isSelected: folder.name === "All Papers",
      isRenaming: false,
      folders: [],
    })),
  );
  const [papers, setPapers] = useState<Paper[]>(initialPapers);
  const [selectedPapers, setSelectedPapers] = useState<number[]>([]);
  const [openPapers, setOpenPapers] = useState<Paper[]>([]);

  const toggleFolderOpen = (id: number) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === id ? { ...folder, isOpen: !folder.isOpen } : folder,
      ),
    );
  };

  const selectFolder = (id: number) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === id
          ? { ...folder, isSelected: true }
          : { ...folder, isSelected: false },
      ),
    );
  };

  const setFolderRenaming = (folderId: number, isRenaming: boolean) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId ? { ...folder, isRenaming } : folder,
      ),
    );
  };

  const setFolderName = (folderId: number, name: string) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId ? { ...folder, name } : folder,
      ),
    );
  };

  return (
    <LibraryContext.Provider
      value={{
        folders,
        setFolders,
        papers,
        setPapers,
        selectedPapers,
        setSelectedPapers,
        toggleFolderOpen,
        selectFolder,
        setFolderRenaming,
        setFolderName,
        openPapers,
        setOpenPapers,
      }}
    >
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </LibraryContext.Provider>
  );
};

// Define the hook
export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};
