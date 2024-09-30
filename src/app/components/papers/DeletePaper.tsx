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
import { useLibraryContext } from "../providers/LibraryProvider";

export default function DeletePaper() {
  const papers = useLibraryContext((state) => state.papers);
  const setPapers = useLibraryContext((state) => state.setPapers);
  const selectedPapers = useLibraryContext((state) => state.selectedPapers);
  const setSelectedPapers = useLibraryContext(
    (state) => state.setSelectedPapers,
  );
  const handleDeletePapers = async () => {
    await deletePapers(selectedPapers);
    setPapers(papers.filter((paper) => !selectedPapers.includes(paper.id)));
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
