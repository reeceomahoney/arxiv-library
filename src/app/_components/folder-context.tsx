"use client";

import React, { createContext, useContext } from "react";
import type {
  Folder,
  FolderDataContextProps,
  FolderDataProviderProps,
} from "~/lib/definitions";

const FolderDataContext = createContext<FolderDataContextProps | undefined>(
  undefined
);

export const useFolderData = () => {
  const context = useContext(FolderDataContext);
  if (!context) {
    throw new Error("useFolderData must be used within a FolderDataProvider");
  }
  return context;
};

export const FolderDataProvider: React.FC<FolderDataProviderProps> = ({
  children,
  folderData,
  papers,
}) => {
  const [folders, setFolders] = React.useState<Folder[]>(folderData);
  const allPapersFolderId =
    folders.find((f) => f.name === "All Papers")?.id || "";

  const [currentId, setCurrentId] = React.useState(allPapersFolderId);

  return (
    <FolderDataContext.Provider
      value={{ folders, papers, currentId, setFolders, setCurrentId }}
    >
      {children}
    </FolderDataContext.Provider>
  );
};
