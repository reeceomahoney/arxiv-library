"use client";

import { Menu } from "lucide-react";
import { Folder as FolderIcon, ChevronRight, ChevronDown } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/app/_components/ui/sheet";
import AddFolder from "~/app/_components/add-folder";

import type { Folder } from "~/lib/definitions";
import { collectPapers, nestFolders } from "~/lib/utils";
import { useFolderData } from "~/app/_components/folder-context";

export function Explorer() {
  const { folders, papers, setFolders, currentId, setCurrentId } =
    useFolderData();

  const toggleFolder = (id: string): void => {
    setFolders((folders) =>
      folders.map((f) => (f.id === id ? { ...f, isOpen: !f.isOpen } : f)),
    );
  };

  const getNumPapers = (folder: Folder): number => {
    return collectPapers(folder.id, folders, papers).length;
  };

  const renderFolders = (folders: Folder[], depth = 0) => (
    <ul className="list-none">
      {folders.map((folder) => {
        const numPapers = getNumPapers(folder);
        return (
          <li key={folder.id}>
            <div
              className={`text-muted-foreground hover:bg-muted cursor-pointer ${
                currentId === folder.id ? "bg-muted" : ""
              }`}
            >
              <div
                style={{ paddingLeft: `${0.5 + 0.5 * depth}rem` }}
                className={`flex items-center p-2`}
              >
                {folder.folders && folder.folders.length > 0 ? (
                  folder.isOpen ? (
                    <ChevronDown
                      className="hover:text-primary mr-2"
                      onClick={() => toggleFolder(folder.id)}
                    />
                  ) : (
                    <ChevronRight
                      className="hover:text-primary mr-2"
                      onClick={() => toggleFolder(folder.id)}
                    />
                  )
                ) : (
                  <div className="mr-2 h-6 w-6"></div> // Placeholder for alignment
                )}
                <div
                  className={`hover:text-primary flex items-center truncate ${
                    currentId === folder.id ? "text-primary" : ""
                  }`}
                  onClick={() => setCurrentId(folder.id)}
                >
                  <FolderIcon
                    className={`mr-2 flex-shrink-0 fill-current ${
                      folder.name === "All Papers" ? "text-highlight" : ""
                    }`}
                  />
                  <span className="truncate text-sm">{folder.name}</span>
                  {numPapers > 0 && (
                    <span className="text-muted-foreground ml-2 text-sm">
                      ({numPapers})
                    </span>
                  )}
                </div>
              </div>
            </div>
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
