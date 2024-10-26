"use client";

import { Plus } from "lucide-react";
import { Button } from "~/app/components/ui/button";
import { Input } from "~/app/components/ui/input";
import { Label } from "~/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "~/app/components/ui/dialog";
import { createFolder } from "~/server/actions";
import {
  useLibraryContext,
  type FolderUI,
} from "~/app/components/providers/LibraryProvider";

export default function AddFolder() {
  const folders = useLibraryContext((state) => state.folders);
  const addFolders = useLibraryContext((state) => state.addFolders);

  const selectedFolder = folders.find((folder) => folder.isSelected);

  if (!selectedFolder) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newFolder = await createFolder(formData);
    const newFolderUI = {
      ...newFolder,
      isOpen: false,
      isSelected: false,
      isRenaming: false,
      folders: [],
    } as FolderUI;

    // Router refresh wasn't working, so just adding to state
    addFolders([newFolderUI]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mr-4 h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>
            Subfolder of {selectedFolder.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-4 py-2">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input name="name" className="flex-grow" />
            <input
              type="hidden"
              name="selectedFolderId"
              value={selectedFolder.id}
            />
            <DialogClose asChild>
              <Button type="submit">Add</Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
