import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { FolderUI } from "~/app/components/library-provider";
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

  const sortFolders = (folders: FolderUI[]): FolderUI[] => {
    return folders
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder) => ({
        ...folder,
        folders: sortFolders(folder.folders),
      }));
  };

  return sortFolders(nestedFolders);
}

export function getAuthorString(authors: string[] | null) {
  if (!authors || authors.length === 0) return null;

  const getLastName = (fullName: string) => {
    const parts = fullName.split(" ");
    return parts[parts.length - 1];
  };

  if (authors.length === 1) {
    return getLastName(authors[0] ?? "");
  } else {
    return `${getLastName(authors[0] ?? "")} et al.`;
  }
}
