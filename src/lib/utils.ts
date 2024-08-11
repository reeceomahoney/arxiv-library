import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { FolderUI } from "~/app/_components/library-context";
import type { Paper } from "~/server/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Returns all papers in a given folder and its subfolders
export function collectPapers(
  folderId: number,
  allFolders: FolderUI[],
  allPapers: Paper[],
): Paper[] {
  const papers: Paper[] = allPapers.filter(
    (paper) => paper.folderId === folderId,
  );

  const subfolders = allFolders.filter(
    (subfolder) => subfolder.parentFolderId === folderId,
  );

  for (const subfolder of subfolders) {
    const subfolderPapers = collectPapers(subfolder.id, allFolders, allPapers);
    papers.push(...subfolderPapers);
  }

  return papers;
}
