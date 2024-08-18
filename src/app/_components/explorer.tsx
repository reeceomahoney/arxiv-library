"use client";

import React, { useState } from "react";
import { Folder, Menu } from "lucide-react";
import { Folder as FolderIcon, ChevronRight, ChevronDown } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/app/_components/ui/sheet";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/app/_components/ui/context-menu";

import AddFolder from "~/app/_components/add-folder";

import type { FolderUI } from "~/app/_components/library-provider";
import { collectPapers } from "~/lib/utils";
import { useLibrary } from "~/app/_components/library-provider";

// Nest folders into a tree structure for rendering
export function nestFolders(folders: FolderUI[]): FolderUI[] {
  const foldersCopy = folders.map((folder) => ({ ...folder, folders: [] }));
  const nestedFolders: FolderUI[] = [];

  foldersCopy.forEach((folder) => {
    const parentFolder = foldersCopy.find(
      (f) => f.id === folder.parentFolderId,
    ) as FolderUI;
    if (parentFolder) {
      parentFolder.folders.push(folder);
    } else {
      nestedFolders.push(folder);
    }
  });

  return nestedFolders;
}

function FolderContextMenu({
  children,
  folder,
  onRename,
}: {
  children: React.ReactNode;
  folder: FolderUI;
  onRename: (id: number, newName: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleRename = () => {
    setIsRenaming(true);
  };

  const handleRenameSubmit = () => {
    onRename(folder.id, newName);
    setIsRenaming(false);
  };

  // Change this:
  // Move isRenaming into the folder object
  // Clicking the rename button will set isRenaming to true
  // When true, the folder name will be replaced with an input field

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {isRenaming ? (
          <div className="p-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit();
                }
              }}
              autoFocus
            />
          </div>
        ) : (
          <>
            <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
            <ContextMenuItem>Delete</ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

function FolderChevron({
  folder,
  toggleFolderOpen,
}: {
  folder: FolderUI;
  toggleFolderOpen: (id: number) => void;
}) {
  return folder.folders && folder.folders.length > 0 ? (
    folder.isOpen ? (
      <ChevronDown
        className="mr-2 hover:text-primary"
        onClick={() => toggleFolderOpen(folder.id)}
      />
    ) : (
      <ChevronRight
        className="mr-2 hover:text-primary"
        onClick={() => toggleFolderOpen(folder.id)}
      />
    )
  ) : (
    <div className="mr-2 h-6 w-6"></div> // Placeholder for alignment
  );
}

function FolderContent({
  folder,
  selectFolder,
  numPapers,
}: {
  folder: FolderUI;
  selectFolder: (id: number) => void;
  numPapers: number;
}) {
  return (
    <div
      className={`flex items-center truncate hover:text-primary ${
        folder.isSelected ? "text-primary" : ""
      }`}
      onClick={() => selectFolder(folder.id)}
    >
      <FolderIcon
        className={`mr-2 flex-shrink-0 fill-current ${
          folder.name === "All Papers" ? "text-highlight" : ""
        }`}
      />
      <span className="truncate text-sm">{folder.name}</span>
      {numPapers > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          ({numPapers})
        </span>
      )}
    </div>
  );
}

export function Explorer() {
  const { folders, papers, toggleFolderOpen, selectFolder } = useLibrary();

  const getNumPapers = (folder: FolderUI): number => {
    return collectPapers(folder.id, folders, papers).length;
  };

  const renderFolders = (folders: FolderUI[], depth = 0) => (
    <ul className="list-none">
      {folders.map((folder) => {
        const numPapers = getNumPapers(folder);

        const handleRename = (id: number, newName: string) => {
          console.log(`Renaming folder ${id} to ${newName}`);
        };

        return (
          <li key={folder.id}>
            <FolderContextMenu folder={folder} onRename={handleRename}>
              <div
                className={`cursor-pointer text-muted-foreground hover:bg-muted ${
                  folder.isSelected ? "bg-muted" : ""
                }`}
              >
                <div
                  style={{ paddingLeft: `${0.5 + 0.5 * depth}rem` }}
                  className={`flex items-center p-2`}
                >
                  <FolderChevron
                    folder={folder}
                    toggleFolderOpen={toggleFolderOpen}
                  />
                  <FolderContent
                    folder={folder}
                    selectFolder={selectFolder}
                    numPapers={numPapers}
                  />
                </div>
              </div>
            </FolderContextMenu>
            {folder.isOpen && folder.folders && (
              <>{renderFolders(folder.folders, depth + 1)}</>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h1 className="p-6 text-lg font-semibold md:text-2xl">File Explorer</h1>
        <AddFolder />
      </div>
      {renderFolders(nestFolders(folders))}
    </div>
  );
}

export function SheetExplorer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle file explorer</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <Explorer />
      </SheetContent>
    </Sheet>
  );
}
