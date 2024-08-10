// Documents

export type Paper = {
  id: string;
  title: string;
  authors: string[];
  date: string;
  folderId: string;
};

export type Folder = {
  id: string;
  name: string;
  isOpen: boolean;
  parentId: string | null;
  userId: string;
  folders?: Folder[];
  papers?: Paper[];
};

// Context

export type FolderDataContextProps = {
  folders: Folder[];
  papers: Paper[];
  currentId: string;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setCurrentId: React.Dispatch<React.SetStateAction<string>>;
}

export type FolderDataProviderProps = {
  children: React.ReactNode;
  folderData: Folder[];
  papers: Paper[];
}

// Actions

export type CreateFolderData = {
  name: string;
  userId: string;
  parentId?: string;
}