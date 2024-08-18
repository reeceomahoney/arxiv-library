"use client";

import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  Menu,
} from "lucide-react";
import React from "react";

import { Button } from "~/app/_components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/app/_components/ui/context-menu";
import { Sheet, SheetContent, SheetTrigger } from "~/app/_components/ui/sheet";
import { Input } from "~/app/_components/ui/input";

import AddFolder from "~/app/_components/add-folder";

import type { FolderUI } from "~/app/_components/library-provider";
import { useLibrary } from "~/app/_components/library-provider";
import { collectPapers } from "~/lib/utils";
import { renameFolder } from "~/server/actions";

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
  setFolderRenaming,
}: {
  children: React.ReactNode;
  folder: FolderUI;
  setFolderRenaming: (folderId: number, isRenaming: boolean) => void;
}) {
  if (folder.name === "All Papers") {
    return <div onContextMenu={(e) => e.preventDefault()}>{children}</div>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setFolderRenaming(folder.id, true)}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem>Delete</ContextMenuItem>
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
  setFolderRenaming,
  setFolderName,
}: {
  folder: FolderUI;
  selectFolder: (id: number) => void;
  numPapers: number;
  setFolderRenaming: (folderId: number, isRenaming: boolean) => void;
  setFolderName: (folderId: number, name: string) => void;
}) {
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newName =
      ((e.target as HTMLFormElement)?.elements[0] as HTMLInputElement)?.value ??
      folder.name;
    await renameFolder(folder.id, newName);
    setFolderName(folder.id, newName);
    setFolderRenaming(folder.id, false);
  };

  // BUG: Submitting on blur doesn't work as it gets triggered instantly so a form submit is needed
  // BUG: autofocus doesn't work

  return (
    <div
      className={`flex items-center truncate hover:text-primary ${
        folder.isSelected ? "text-primary" : ""
      }`}
      onClick={() => selectFolder(folder.id)}
    >
      {folder.isRenaming ? (
        <form onSubmit={handleRenameSubmit}>
          <Input
            type="text"
            defaultValue={folder.name}
            className="h-6 text-sm"
          />
        </form>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export function Explorer() {
  const {
    folders,
    papers,
    toggleFolderOpen,
    selectFolder,
    setFolderRenaming,
    setFolderName,
  } = useLibrary();

  const getNumPapers = (folder: FolderUI): number => {
    return collectPapers(folder.id, folders, papers).length;
  };

  const renderFolders = (folders: FolderUI[], depth = 0) => (
    <ul className="list-none">
      {folders.map((folder) => {
        const numPapers = getNumPapers(folder);

        return (
          <li key={folder.id}>
            <FolderContextMenu
              folder={folder}
              setFolderRenaming={setFolderRenaming}
            >
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
                    setFolderRenaming={setFolderRenaming}
                    setFolderName={setFolderName}
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
