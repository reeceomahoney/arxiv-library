import { Plus } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "~/app/_components/ui/dialog";

import { createFolder } from "~/lib/actions";
import { useFolderData } from "~/app/_components/folder-context";

export default function AddFolder() {
  const { folders, currentId } = useFolderData();
  const currentName = folders.find((folder) => folder.id === currentId)?.name;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mr-4 h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
        </DialogHeader>
        <form action={createFolder}>
          <div className="flex items-center gap-4 py-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input name="name" className="flex-grow" />
            <input type="hidden" name="currentId" value={currentId} />
            <DialogClose>
              <Button type="submit">Add</Button>
            </DialogClose>
          </div>
        </form>
        <DialogFooter>Subfolder of {currentName}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
