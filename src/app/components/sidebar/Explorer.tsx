"use client";

import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  Menu,
} from "lucide-react";
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import { Button } from "~/app/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/app/components/ui/context-menu";
import { Input } from "~/app/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "~/app/components/ui/sheet";

import AddFolder from "./AddFolder";
import type { FolderUI } from "~/app/components/providers/LibraryProvider";
import { useLibrary } from "~/app/components/providers/LibraryProvider";
import { DialogDescription, DialogTitle } from "~/app/components/ui/dialog";
import { collectPapers, nestFolders } from "~/lib/utils";
import {
  deleteFolders,
  moveFolder,
  movePapers,
  renameFolder,
} from "~/server/actions";

function FolderContextMenu({
  children,
  folder,
}: {
  children: React.ReactNode;
  folder: FolderUI;
}) {
  const { setFolders, setFolderRenaming } = useLibrary();

  if (folder.name === "All Papers") {
    return <div onContextMenu={(e) => e.preventDefault()}>{children}</div>;
  }

  const handleDeleteFolders = async () => {
    await deleteFolders([folder.id]);
    setFolders((prevFolders) =>
      prevFolders.filter(
        (f) => f.id !== folder.id && f.parentFolderId !== folder.id,
      ),
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setFolderRenaming(folder.id, true)}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDeleteFolders}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function FolderChevron({ folder }: { folder: FolderUI }) {
  const { toggleFolderOpen } = useLibrary();
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

// BUG: Submitting on blur doesn't work as it gets triggered instantly so a form submit is needed
// BUG: autofocus doesn't work
function FolderContent({ folder, depth }: { folder: FolderUI; depth: number }) {
  const {
    selectFolder,
    setFolderRenaming,
    setFolderName,
    setFolders,
    folders,
    papers,
    setSelectedPapers,
    setPapers,
  } = useLibrary();
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FOLDER",
    item: { id: folder.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: ["FOLDER", "PAPER"],
    drop: async (item: { id: number }, monitor) => {
      // Folder drop
      if (monitor.getItemType() === "FOLDER") {
        await handleMoveFolder(item.id, folder.id);
      } else if (monitor.getItemType() === "PAPER") {
        await handleMovePapers(item.id, folder.id);
      }
    },
    collect: (monitor) => ({
      isOverFolder: monitor.isOver(),
      isOverPaper: monitor.isOver(),
    }),
  }));

  const handleMoveFolder = async (itemId: number, folderId: number) => {
    if (itemId === folderId) return;

    await moveFolder(itemId, folderId);
    setFolders((prevFolders) =>
      prevFolders.map((f) =>
        f.id === itemId ? { ...f, parentFolderId: folderId } : f,
      ),
    );
  };

  // We've had to use the functional state update to get the latest selected papers
  const handleMovePapers = async (itemId: number, folderId: number) => {
    setSelectedPapers((prevSelectedPapers) => {
      // Add the current paper to selected papers if it's not already there
      const draggedPapers = prevSelectedPapers.includes(itemId)
        ? prevSelectedPapers
        : [...prevSelectedPapers, itemId];

      movePapers(draggedPapers, folderId)
        .then(() => {
          setPapers((prevPapers) =>
            prevPapers.map((paper) =>
              draggedPapers.includes(paper.id)
                ? { ...paper, folderId: folderId }
                : paper,
            ),
          );
        })
        .catch((error) => console.error(error));

      return [];
    });
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newName =
      ((e.target as HTMLFormElement)?.elements[0] as HTMLInputElement)?.value ??
      folder.name;
    await renameFolder(folder.id, newName);
    setFolderName(folder.id, newName);
    setFolderRenaming(folder.id, false);
  };

  drag(drop(ref));

  const numPapers = collectPapers(folder.id, folders, papers).length;

  return (
    <div
      style={{ paddingLeft: `${0.5 + 0.5 * depth}rem` }}
      className={`flex items-center p-2`}
    >
      <FolderChevron folder={folder} />
      <div
        ref={ref}
        className={`flex items-center truncate hover:text-primary ${
          folder.isSelected ? "text-primary" : ""
        } ${isDragging ? "opacity-50" : ""}`}
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
    </div>
  );
}

export function Explorer() {
  const { folders } = useLibrary();

  const renderFolders = (folders: FolderUI[], depth = 0) => (
    <ul className="list-none">
      {folders.map((folder) => {
        return (
          <li key={folder.id}>
            <FolderContextMenu folder={folder}>
              <div
                className={`cursor-pointer text-muted-foreground hover:bg-muted ${
                  folder.isSelected ? "bg-muted" : ""
                }`}
              >
                <FolderContent folder={folder} depth={depth} />
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
        {/* To prevent error message */}
        <DialogTitle> </DialogTitle>
        <DialogDescription> </DialogDescription>
        <Explorer />
      </SheetContent>
    </Sheet>
  );
}