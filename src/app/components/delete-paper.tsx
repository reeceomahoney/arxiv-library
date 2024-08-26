import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/app/components/ui/alert-dialog";
import { Button } from "~/app/components/ui/button";
import { deletePapers } from "~/server/actions";
import { type Paper } from "~/server/db/schema";

interface DeletePaperProps {
  selectedPapers: number[];
  setSelectedPapers: React.Dispatch<React.SetStateAction<number[]>>;
  setPapers: React.Dispatch<React.SetStateAction<Paper[]>>;
}

export default function DeletePaper({
  selectedPapers,
  setSelectedPapers,
  setPapers,
}: DeletePaperProps) {
  const handleDeletePapers = async () => {
    await deletePapers(selectedPapers);
    setPapers((prevPapers) =>
      prevPapers.filter((paper) => !selectedPapers.includes(paper.id)),
    );
    setSelectedPapers([]);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={selectedPapers.length === 0}
          size="icon"
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            papers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSelectedPapers([])}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeletePapers()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
