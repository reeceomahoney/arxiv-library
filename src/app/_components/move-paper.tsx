import { FolderInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

import { nestFolders } from "./explorer";
import { type FolderUI, useLibrary } from "./library-provider";
import type { Paper } from "~/server/db/schema";
import { movePapers } from "~/server/actions";

interface MovePaperProps {
  selectedPapers: number[];
  setSelectedPapers: React.Dispatch<React.SetStateAction<number[]>>;
  setPapers: React.Dispatch<React.SetStateAction<Paper[]>>;
}

function generateFolderPaths(folders: FolderUI[], parentPath = "") {
  let paths: Record<string, number> = {};
  for (const folder of folders) {
    const currentPath = parentPath
      ? `${parentPath} / ${folder.name}`
      : folder.name;
    paths[currentPath] = folder.id;
    if (folder.folders && folder.folders.length > 0) {
      const nestedPaths = generateFolderPaths(folder.folders, currentPath);
      paths = { ...paths, ...nestedPaths };
    }
  }
  return paths;
}

export default function MovePaper({
  selectedPapers,
  setSelectedPapers,
  setPapers,
}: MovePaperProps) {
  const { folders, papers } = useLibrary();
  const nestedFolders = nestFolders(folders);
  const folderPaths = generateFolderPaths(nestedFolders);

  const handleMovePapers = async (folderId: number) => {
    await movePapers(selectedPapers, folderId);
    const updatedPapers = papers.map((paper) =>
      selectedPapers.includes(paper.id)
        ? { ...paper, folderId: folderId ?? null }
        : paper,
    );
    setPapers(updatedPapers);
    setSelectedPapers([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={selectedPapers.length === 0}
          size="icon"
        >
          <FolderInput />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(folderPaths).map(([path, id]) => (
          <DropdownMenuItem key={id} onClick={() => handleMovePapers(id)}>
            {path}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
