"use client";

import { File, Files } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";
import AddPaper from "./add-paper";
import DeletePaper from "./delete-paper";
import { Checkbox } from "./ui/checkbox";

import { collectPapers } from "~/lib/utils";
import type { Paper } from "~/server/db/schema";
import { useLibrary } from "./library-provider";

function getAuthorString(authors: string[] | null) {
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

function PaperDragLayer({ count }: { count: number }) {
  const { itemType, isDragging, clientOffset } = useDragLayer((monitor) => ({
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  if (!isDragging || !clientOffset || itemType !== "PAPER") return null;

  // BUG: The previw should be using the draggable count
  return (
    <div
      className="pointer-events-none fixed"
      style={{ left: clientOffset.x, top: clientOffset.y }}
    >
      {count > 1 ? <Files size={32} /> : <File size={32} />}
    </div>
  );
}

function PaperRow({
  paper,
  isSelected,
  handleSelectPaper,
}: {
  paper: Paper;
  isSelected: boolean;
  handleSelectPaper: (id: number) => void;
}) {
  const ref = useRef(null);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "PAPER",
    item: { id: paper.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  drag(ref);

  return (
    <TableRow ref={ref} className={`${isDragging ? "opacity-50" : ""}`}>
      <TableCell>
        <Checkbox
          className="align-middle"
          checked={isSelected}
          onCheckedChange={() => handleSelectPaper(paper.id)}
        />
      </TableCell>
      <TableCell>{paper.title}</TableCell>
      <TableCell>{getAuthorString(paper.authors)}</TableCell>
      <TableCell>{paper.publicationDate}</TableCell>
    </TableRow>
  );
}

export default function PaperTable() {
  const { folders, papers, setPapers, selectedPapers, setSelectedPapers } =
    useLibrary();
  const selectedFolder = folders.find((folder) => folder.isSelected);
  const title = selectedFolder?.name;

  const filteredPapers = selectedFolder
    ? collectPapers(selectedFolder.id, folders, papers)
    : [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPapers(filteredPapers.map((paper) => paper.id));
    } else {
      setSelectedPapers([]);
    }
  };

  const handleSelectPaper = (paperId: number) => {
    setSelectedPapers((prevSelected) =>
      prevSelected.includes(paperId)
        ? prevSelected.filter((id) => id !== paperId)
        : [...prevSelected, paperId],
    );
  };

  return (
    <>
      <PaperDragLayer count={selectedPapers.length} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        <div className="flex items-center gap-4">
          <AddPaper />
          <DeletePaper
            selectedPapers={selectedPapers}
            setSelectedPapers={setSelectedPapers}
            setPapers={setPapers}
          />
        </div>
      </div>
      {filteredPapers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  className="align-middle"
                  checked={selectedPapers.length === filteredPapers.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-2/3">Title</TableHead>
              <TableHead className="w-1/6">Authors</TableHead>
              <TableHead className="w-1/6">Publication Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPapers.map((paper) => (
              <PaperRow
                key={paper.id}
                paper={paper}
                isSelected={selectedPapers.includes(paper.id)}
                handleSelectPaper={handleSelectPaper}
              />
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No papers</p>
      )}
    </>
  );
}
